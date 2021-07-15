import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  ConfirmDTO,
  LoginDTO,
  RegisterDTO,
  RegisterUserDTO,
} from '../user/user.model'
import { InjectRepository } from '@nestjs/typeorm'
import { UserEntity } from '../user/user.entity'
import { Roles } from '../roles/roles.entity'
import { LessThanOrEqual, Repository } from 'typeorm'
import { SignOptions, TokenExpiredError } from 'jsonwebtoken'
import { Token } from '../token/token.entity'
import { List } from '../list/list.entity'
import { MailService } from '../mail/mail.service'
import { AuthCode } from './auth_codes.entity'

const randtoken = require('rand-token')

export interface AuthenticationPayloadWithPermissions {
  user: UserEntity
  permissions: string[]
  payload: {
    token: string
    refreshToken?: Record<string, string>
  }
}

export interface AuthenticationPayload {
  user: UserEntity
  payload: {
    token: string
    refreshToken?: Record<string, string>
  }
}

export interface RefreshTokenPayload {
  jti: string
  sub: number
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    @InjectRepository(AuthCode)
    private codsRepository: Repository<AuthCode>,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async registerUser(credentials: RegisterUserDTO) {
    const isUserExist = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .where('LOWER(user.email) = LOWER(:email)', { email: credentials.email })
      .getOne()

    if (!isUserExist) {
      const user = this.userRepository.create(
        Object.assign(credentials, { active: true, confirmed: true })
      )

      const u = await user.save()

      await this.listsRepository.save({ creator: u, name: 'Default' })

      return user
    }

    throw new ConflictException('Email has already been taken')
  }

  async register(credentials: RegisterDTO): Promise<any> {
    const isUserExist = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .where('LOWER(user.email) = LOWER(:email)', { email: credentials.email })
      .getOne()

    if (isUserExist) {
      throw new ConflictException('Email has already been taken')
    }

    const role = await this.rolesRepository
      .createQueryBuilder('role')
      .where('role.role = (:role)', { role: 'Content Contributor' })
      .getOne()

    const user = this.userRepository.create(
      Object.assign(credentials, { active: false, confirmed: false, role })
    )

    const savedUser = await user.save()

    await this.listsRepository.save({ creator: savedUser, name: 'Default' })

    const code = randtoken.generate(8)

    await this.codsRepository.save({ user: savedUser, activation_code: code })

    this.mailService.sendUserConfirmation(savedUser, code)
    this.mailService.sendNotification(savedUser)

    return savedUser
  }

  async confirm(data: ConfirmDTO): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .where('users.id = (:id)', { id: data.userId })
      .getOne()

    if (!user) {
      throw new ConflictException('Your account deleted!')
    } else if (user.active) {
      throw new ConflictException('Your account already active. Please login.')
    } else if (user.confirmed) {
      throw new ConflictException(
        'Your account was deactivated. You can send Feedback for more info.'
      )
    }

    const activationCodes = await this.codsRepository
      .createQueryBuilder('auth_codes')
      .select(['auth_codes.activation_code', 'user.id'])
      .leftJoin('auth_codes.user', 'user')
      .where('user.id = (:id)', { id: data.userId })
      .getMany()

    const activationCode = activationCodes.slice(-1)[0]

    if (!activationCode || activationCode.activation_code !== data.code) {
      throw new ConflictException('Activation code expired or incorrect!')
    }

    user.confirmed = true
    user.active = true
    await this.userRepository.save(user)

    const role = await this.rolesRepository.findOne(user.role.id, {
      relations: ['permissions'],
    })
    const permissions = role.permissions.map(element => {
      return element.permission
    })
    user.role = role

    const token = await this.generateAccessToken(user)
    const refresh = await this.generateRefreshToken(user, 2592000)

    return AuthService.buildResponsePayloadWithPermissions(
      user,
      permissions,
      token,
      refresh
    )
  }

  async login({ email, password }: LoginDTO): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.role', 'role')
      .where('LOWER(users.email) = LOWER(:email)', { email })
      .getOne()

    if (!user) {
      throw new UnauthorizedException('Wrong Email or Password.')
    } else if (!user.active) {
      if (user.confirmed) {
        throw new UnauthorizedException(
          'Your account was deactivated. ' +
            'You can send Feedback for more info.'
        )
      } else {
        const sentCode = await this.codsRepository
          .createQueryBuilder('auth_codes')
          .leftJoinAndSelect('auth_codes.user', 'user')
          .where('user.id = (:id)', { id: user.id })
          .getOne()
        if (sentCode) {
          throw new UnauthorizedException('Your account is not confirmed.')
        } else {
          throw new UnauthorizedException(
            'Your account was deactivated. ' +
              'You can send Feedback for more info.'
          )
        }
      }
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      throw new UnauthorizedException('Wrong Email or Password.')
    }

    const roles = await this.rolesRepository.findOne(user.role.id, {
      relations: ['permissions'],
    })
    const permissions = roles.permissions.map(element => {
      return element.permission
    })
    user.role = roles

    const token = await this.generateAccessToken(user)
    const refresh = await this.generateRefreshToken(user, 2592000)

    return AuthService.buildResponsePayloadWithPermissions(
      user,
      permissions,
      token,
      refresh
    )
  }

  async refresh(refresh: string): Promise<any> {
    const {
      user,
      token,
      refreshToken,
    } = await this.createAccessTokenFromRefreshToken(refresh)

    const roles = await this.rolesRepository.findOne(user.role.id, {
      relations: ['permissions'],
    })
    const permissions = roles.permissions.map(element => {
      return element.permission
    })
    user.role = roles

    return AuthService.buildResponsePayloadWithPermissions(
      user,
      permissions,
      token,
      refreshToken
    )
  }

  public async createAccessTokenFromRefreshToken(
    refresh: string
  ): Promise<any> {
    const { user, payload } = await this.resolveRefreshToken(refresh)
    const token = await this.generateAccessToken(user)
    const refreshToken = await this.generateRefreshToken(user, 2592000, payload)

    return { user, token, refreshToken }
  }

  public async resolveRefreshToken(encoded: string): Promise<any> {
    const payload = await this.decodeRefreshToken(encoded)

    const token = await this.getStoredTokenFromRefreshTokenPayload(payload)
    if (!token) {
      throw new UnprocessableEntityException('Refresh token not found')
    }

    const user = await this.getUserFromRefreshTokenPayload(payload)
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return { user, payload }
  }

  private async decodeRefreshToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token)
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired')
      } else {
        throw new UnprocessableEntityException('Refresh token malformed')
      }
    }
  }

  private async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenPayload
  ): Promise<string | null> {
    const refreshToken = payload.jti
    if (!refreshToken) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    const token = await this.tokenRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    })

    if (!token) {
      return null
    }

    const user = await this.userRepository.findOne({
      where: { id: token.user.id },
    })

    if (!user) {
      return null
    }

    return token.refreshToken
  }

  private async getUserFromRefreshTokenPayload(
    payload: RefreshTokenPayload
  ): Promise<UserEntity> {
    const userId = payload.sub
    if (!userId) {
      throw new UnprocessableEntityException('Refresh token malformed')
    }

    return this.userRepository.findOne(userId)
  }

  public async generateAccessToken(user: UserEntity): Promise<string> {
    const opts: SignOptions = {
      subject: String(user.id),
    }

    return this.jwtService.signAsync({}, opts)
  }

  public async generateRefreshToken(
    user: UserEntity,
    expiresInSeconds: number,
    oldToken?: Record<string, undefined>
  ): Promise<any> {
    const refreshToken = randtoken.generate(16)

    const expirationDate = new Date()
    expirationDate.setTime(expirationDate.getTime() + expiresInSeconds * 1000)

    if (oldToken && oldToken.jti) {
      const exsting = await this.tokenRepository.findOne({
        refreshToken: oldToken.jti,
      })

      if (exsting) {
        await this.tokenRepository.delete(exsting.id)
      }
    }

    await this.tokenRepository.delete({
      expirationDate: LessThanOrEqual(new Date()),
    })

    await this.tokenRepository.save({
      user,
      refreshToken,
      expirationDate,
    })

    const opts: SignOptions = {
      subject: String(user.id),
      expiresIn: expiresInSeconds,
      jwtid: refreshToken,
    }

    return {
      token: await this.jwtService.signAsync({}, opts),
      expiration: expirationDate,
    }
  }

  private static buildResponsePayloadWithPermissions(
    user: UserEntity,
    permissions: string[],
    accessToken: string,
    refreshToken?: any
  ): AuthenticationPayloadWithPermissions {
    return {
      user,
      permissions,
      payload: {
        token: accessToken,
        ...(refreshToken.token
          ? {
              refresh: {
                token: refreshToken.token,
                expirtaion: refreshToken.expiration,
              },
            }
          : {}),
      },
    }
  }

  public logOutFromAllDevices = async (refresh: string): Promise<any> => {
    const { user, payload } = await this.resolveRefreshToken(refresh)

    return await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .from('tokens')
      .where('expirationDate <= :time', { time: new Date().toISOString() })
      .andWhere('refreshToken != :payload', { payload: payload.jti })
      .execute()
  }
}
