import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Activity } from '../activity/activity.entity'
import { Organization } from '../organization/organization.entity'

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  name: string

  @Column({ default: '' })
  phone: string

  @Column({ default: '', nullable: true })
  email: string

  @Column({ default: '' })
  other: string

  @ManyToOne(
    type => Organization,
    organization => organization.contacts,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'organizationId' })
  organization: Organization

  @ManyToOne(
    type => Activity,
    activity => activity.contacts,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'activityId' })
  activity: Activity
}
