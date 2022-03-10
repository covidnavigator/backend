import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Article } from './article.entity'

@Entity('article_external_sources')
export class ArticleExternalSources {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  articleId: number

  @Column()
  external_name: string

  @Column()
  external_ids: string

  @ManyToOne(
    () => Article,
    article => article.external_sources,
    { onDelete: 'CASCADE' }
  )
  article: Article
}