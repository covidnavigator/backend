import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Activity } from './activity.entity'
import { Organization } from '../organization/organization.entity'

@Entity('activity_organizations')
export class ActivityOrganization {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  activityId: number

  @Column()
  organizationId: number

  @Column({ default: false })
  owner: boolean

  @ManyToOne(
    () => Activity,
    activity => activity.activity_organization,
    { onDelete: 'CASCADE' }
  )
  activity: Activity

  @ManyToOne(
    () => Organization,
    organization => organization.activity_organization,
    { onDelete: 'CASCADE' }
  )
  organization: Organization
}
