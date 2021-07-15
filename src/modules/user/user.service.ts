import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcryptjs'

import { UserEntity } from './user.entity'
import { Roles } from '../roles/roles.entity'
import { UpdatePasswordDTO, UpdateUserDTO } from './user.model'
import { UserInterface } from './user.interface'
import { List } from '../list/list.entity'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { PaginatedUsersResultDto } from '../dto/users.paginatedResults'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>
  ) {}

  private userToResponseObject(user: UserEntity): UserInterface {
    const responseObject = {
      id: user.id,
      active: user.active,
      organization: user.organization,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      email: user.email,
      username: user.username,
      role: user.role.role,
      articlesCount: user.articlesCount,
      activitiesCount: user.activitiesCount,
    }

    return responseObject
  }

  async getUsers(): Promise<UserInterface[]> {
    const users = await this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.username',
        'users.email',
        'users.createdAt',
        'users.updatedAt',
        'users.active',
        'users.organization',
        'role.role',
      ])
      .leftJoin('users.role', 'role')
      .orderBy('users.id', 'ASC')
      .getMany()

    const response = []

    for (let i = 0; i < users.length; i++) {
      response.push(this.userToResponseObject(users[i]))
    }

    return response
  }

  async getPaginatedUsers(
    paginationDto: PaginationSearchDto
  ): Promise<PaginatedUsersResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    const usersQuery = this.userRepository
      .createQueryBuilder('users')
      .select([
        'users.id',
        'users.username',
        'users.email',
        'users.createdAt',
        'users.updatedAt',
        'users.active',
        'users.organization',
        'role.role',
      ])
      .leftJoin('users.role', 'role')
      .offset(skippedItems)
      .limit(paginationDto.limit)
      .orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )

    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'username') {
        where = 'LOWER(users.username) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'email') {
        where = 'LOWER(users.email) like LOWER(:searchString)'
      }
      if (where) {
        usersQuery.where(where, parameters)
      }
    }

    const [users, usersCount] = await usersQuery.getManyAndCount()

    const preparedUsers = []

    for (let i = 0; i < users.length; i++) {
      preparedUsers.push(this.userToResponseObject(users[i]))
    }

    return {
      totalCount: usersCount,
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: preparedUsers,
    }
  }

  async getUsersCount(): Promise<number> {
    return await this.userRepository.count()
  }

  async getUser(id: number): Promise<UserInterface> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.organization',
        'role.role',
      ])
      .leftJoin('user.role', 'role')
      .where('user.id = :id', { id: id })
      .getOne()

    return this.userToResponseObject(user)
  }

  async updateUserPassword(
    user: UserEntity,
    data: UpdatePasswordDTO
  ): Promise<UserEntity> {
    const userForUpdate = await this.userRepository.findOne(user.id)

    const isValid = await userForUpdate.comparePassword(data.currentPassword)
    if (!isValid) {
      throw new BadRequestException('Wrong current password!')
    }

    userForUpdate.password = await bcrypt.hash(data.newPassword, 10)

    return await this.userRepository.save(userForUpdate)
  }

  async updateUser(id: number, data: UpdateUserDTO): Promise<UserInterface> {
    const userToUpdate = await this.userRepository.findOne(id)

    if (
      data.email &&
      userToUpdate.email.toLowerCase() !== data.email.toLowerCase()
    ) {
      const userByEmail = await this.userRepository
        .createQueryBuilder('users')
        .where('LOWER(users.email) = LOWER(:email)', { email: data.email })
        .getOne()

      if (userByEmail) {
        throw new BadRequestException('Email has already been taken')
      }
    }

    if (
      (data.password && data.password.length === 0) ||
      (!data.password &&
        ((data.username && data.username.length === 0) ||
          (data.email && data.email.length === 0)))
    ) {
      throw new BadRequestException('One of the fields is empty')
    }

    if (data.password) {
      userToUpdate.password = await bcrypt.hash(data.password, 10)
      await this.userRepository.save(userToUpdate)
    } else {
      await this.userRepository.update({ id }, data)
    }

    return this.userToResponseObject(userToUpdate)
  }

  async deleteUser(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne(id)
    return await this.userRepository.remove(user)
  }

  async findByUsername(username: string): Promise<UserInterface> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.organization',
        'role.role',
      ])
      .leftJoin('user.role', 'role')
      .loadRelationCountAndMap('user.articlesCount', 'user.posts')
      .loadRelationCountAndMap('user.activitiesCount', 'user.activities')
      .where('user.username = :username', { username: username })
      .getOne()

    return this.userToResponseObject(user)
  }

  async getProfileInfo(username: string): Promise<UserInterface> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'role.role'])
      .leftJoin('user.role', 'role')
      .loadRelationCountAndMap('user.articlesCount', 'user.posts')
      .loadRelationCountAndMap('user.activitiesCount', 'user.activities')
      .where('user.username = :username', { username: username })
      .getOne()

    return this.userToResponseObject(user)
  }
}
