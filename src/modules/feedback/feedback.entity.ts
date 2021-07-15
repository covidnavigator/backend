import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm'

export enum feedback_status {
  ALL = 'All',
  NEW = 'New',
  IMPORTANT = 'Important',
  RESOLVED = 'Resolved',
  IGNORE = 'Ignore',
  HIDDEN = 'Hidden',
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  title: string

  @Column({ default: '' })
  message: string

  @Column({ default: '' })
  userEmail: string

  @Column({ default: '' })
  username: string

  @Column({ type: 'enum', enum: feedback_status, default: feedback_status.NEW })
  status: feedback_status

  @Column({ default: '' })
  disposition: string

  @CreateDateColumn()
  created: Date
}
