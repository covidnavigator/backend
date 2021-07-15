import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { Permissions } from '../permissions/permissions.entity'
@Entity('roles')
export class Roles {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  role: string

  @OneToMany(
    type => UserEntity,
    user => user.role
  )
  users: UserEntity[]

  @ManyToMany(
    type => Permissions,
    permissions => permissions.roles,
    { cascade: true, eager: true }
  )
  @JoinTable()
  permissions: Permissions[]
}
