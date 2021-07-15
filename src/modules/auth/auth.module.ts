import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AuthCode } from './auth_codes.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../user/user.entity'
import { Roles } from '../roles/roles.entity'
import { JwtStrategy } from './jwt.strategy'
import { Token } from '../token/token.entity'
import { List } from '../list/list.entity'
import { MailModule } from '../mail/mail.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Roles, Token, List, AuthCode]),
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '10m',
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MailModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, AuthService, PassportModule],
})
export class AuthModule {}
