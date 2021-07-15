import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { ArticleCurator } from '../article/article_curator.entity'
import { Article } from '../article/article.entity'
import { Contact } from '../contact/contact.entity'
import { ActivityOrganization } from '../activity/activity_organizrtion.entity'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  name: string

  @Column({ default: '' })
  type: string

  @Column({ default: '' })
  description: string

  @OneToMany(
    () => KeywordsConsolidated,
    keywordsConsolidated => keywordsConsolidated.organization
  )
  keywords: KeywordsConsolidated[]

  @OneToMany(
    type => Contact,
    contact => contact.organization,
    { cascade: true }
  )
  contacts: Contact[]

  @OneToMany(
    type => Article,
    article => article.organization
  )
  articles: Article[]

  @OneToMany(
    () => ArticleCurator,
    article_curator => article_curator.curator
  )
  article_curator: ArticleCurator[]

  @OneToMany(
    () => ActivityOrganization,
    activity_organization => activity_organization.organization
  )
  activity_organization: ActivityOrganization[]
}
