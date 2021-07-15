import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm'

import { UserEntity } from '../user/user.entity'

@Entity('auth_codes')
export class AuthCode {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  activation_code: string

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: UserEntity
}
