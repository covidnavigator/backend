import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm'
import { UserEntity } from '../user/user.entity'
import { Article } from '../article/article.entity'
import { Activity } from '../activity/activity.entity'

@Entity('list')
export class List {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  name: string

  @Column({ default: '' })
  description: string

  @ManyToMany(
    type => Article,
    article => article.listIds
  )
  @JoinTable()
  articles: Article[]

  @ManyToMany(
    type => Activity,
    activity => activity.listIds
  )
  @JoinTable()
  activities: Activity[]

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  creator: UserEntity
}
