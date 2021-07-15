import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Article } from './article.entity'
import { Organization } from '../organization/organization.entity'

@Entity('article_curators')
export class ArticleCurator {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  articleId: number

  @Column()
  curatorId: number

  @Column()
  valuation: string

  @ManyToOne(
    () => Article,
    article => article.article_curator,
    { onDelete: 'CASCADE' }
  )
  article: Article

  @ManyToOne(
    () => Organization,
    curator => curator.article_curator,
    { onDelete: 'CASCADE' }
  )
  curator: Organization
}
