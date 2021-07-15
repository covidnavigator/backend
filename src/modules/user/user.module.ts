import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserEntity } from './user.entity'
import { Roles } from '../roles/roles.entity'
import { List } from '../list/list.entity'
import { PassportModule } from '@nestjs/passport'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, Roles, List]),
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt-refreshtoken' }),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
