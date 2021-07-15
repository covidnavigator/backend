import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm'
import { Contact } from '../contact/contact.entity'
import { ActivityOrganization } from './activity_organizrtion.entity'
import { UserEntity } from '../user/user.entity'
import { Article } from '../article/article.entity'
import { activityKnowledge, categories } from '../enums'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { List } from '../list/list.entity'

@Entity('activity')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  @Index()
  status: string

  @Column({ default: '' })
  @Index()
  name: string

  @Column({ type: 'text', default: '' })
  shortDescription: string

  @Column({ type: 'text', default: '' })
  description: string

  @Column({ type: 'text', default: '' })
  url: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  @OneToMany(
    () => KeywordsConsolidated,
    keywords => keywords.activity
  )
  keywords: KeywordsConsolidated[]

  @OneToMany(
    type => Contact,
    contact => contact.activity,
    { cascade: true }
  )
  contacts: Contact[]

  @Column({
    type: 'enum',
    array: true,
    enum: activityKnowledge,
    nullable: true,
  })
  knowledgeStages: activityKnowledge

  @Column({ type: 'enum', array: true, enum: categories, nullable: true })
  categories: categories

  @ManyToMany(
    type => Article,
    articles => articles.activities
  )
  @JoinTable()
  articles: Article[]

  @ManyToMany(
    type => Activity,
    activity => activity.related
  )
  @JoinTable()
  related: Activity[]

  @OneToMany(
    () => ActivityOrganization,
    activity_organization => activity_organization.activity
  )
  activity_organization: ActivityOrganization[]

  @ManyToMany(
    type => List,
    list => list.activities
  )
  listIds: List[]

  @ManyToOne(() => UserEntity, { cascade: true })
  author: UserEntity
}
