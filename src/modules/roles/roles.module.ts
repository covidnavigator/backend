import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RolesController } from './roles.controller'
import { RolesService } from './roles.service'
import { Roles } from './roles.entity'
import { Permissions } from '../permissions/permissions.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Roles, Permissions])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
