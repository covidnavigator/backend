import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { Roles } from './roles.entity'
import { UpdateRolesDTO } from './roles.model'
import { Permissions } from '../permissions/permissions.entity'

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>
  ) {}

  async getRoles(): Promise<Roles[]> {
    return await this.rolesRepository.find({
      relations: ['permissions'],
    })
  }

  async getRole(id: number): Promise<Roles> {
    return await this.rolesRepository.findOne(id, {
      relations: ['permissions'],
    })
  }

  async updateRole(id: number, updateRole: UpdateRolesDTO): Promise<Roles> {
    let permissions = []
    if(updateRole.permissions.length){
      permissions = await this.permissionsRepository.find({
        permission: In(updateRole.permissions),
      })
    }

    const role = await this.rolesRepository.findOne(id)

    role.permissions = permissions

    return await this.rolesRepository.save(role)
  }
}
