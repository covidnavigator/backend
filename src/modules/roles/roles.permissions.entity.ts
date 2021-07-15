// import {
//   Column,
//   Entity,
//   PrimaryGeneratedColumn,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   ManyToMany,
//   RelationId,
//   JoinTable,
//   OneToMany,
//   BaseEntity,
//   PrimaryColumn,
//   JoinColumn,
// } from 'typeorm'
// import { Roles } from './roles.entity'
// import { Permissions } from '../permissions/permissions.entity'

// @Entity('rolePermission')
// export class RolePermission extends BaseEntity {
//   @PrimaryColumn()
//   roleId: number

//   @PrimaryColumn()
//   permissionId: number

//   @ManyToOne(
//     () => Roles,
//     roles => roles.permissionConnection,
//     { eager: true, cascade: true }
//   )
//   role: Roles

//   @ManyToOne(() => Permissions, { eager: true, cascade: true })
//   permission: Permissions

// }
