import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
} from 'typeorm'
import { Article } from '../article/article.entity'
import { Activity } from '../activity/activity.entity'
import { Organization } from '../organization/organization.entity'
import { Keyword } from './keywords.entity'

@Entity('keywordsConsolidated')
export class KeywordsConsolidated {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    () => Keyword,
    keyword => keyword.consolidated,
    { onDelete: 'CASCADE' }
  )
  keyword: Keyword

  @ManyToOne(
    () => Organization,
    organization => organization.keywords,
    {
      onDelete: 'SET NULL',
    }
  )
  organization: Organization

  @ManyToOne(
    () => Article,
    article => article.keywords,
    {
      onDelete: 'SET NULL',
    }
  )
  article: Article

  @ManyToOne(
    () => Activity,
    activity => activity.keywords,
    {
      onDelete: 'SET NULL',
    }
  )
  activity: Activity
}
