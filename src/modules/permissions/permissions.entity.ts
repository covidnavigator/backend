import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm'
import { Roles } from '../roles/roles.entity'

@Entity('permissions')
export class Permissions {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  permission: string

  @ManyToMany(
    type => Roles,
    roles => roles.permissions
  )
  roles: Roles[]
}
