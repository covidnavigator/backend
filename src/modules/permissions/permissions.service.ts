import { Injectable } from '@nestjs/common'
import { UserEntity } from '../user/user.entity'

@Injectable()
export class PermissionsService {
  checkPermissions(user: UserEntity, permission: string): boolean {
    return user.role.permissions
      .map(permission => permission.permission)
      .includes(permission)
  }
}
