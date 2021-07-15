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
import { Activity } from '../activity/activity.entity'
import { ArticleCurator } from './article_curator.entity'
import { categories, formalism, role } from '../enums'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { List } from '../list/list.entity'
import { Organization } from '../organization/organization.entity'
import { UserEntity } from '../user/user.entity'
import { Country } from '../geography/entities/countries.entity'
import { PanCountry } from '../geography/entities/pancountries.entity'
import { Region } from '../geography/entities/regions.entity'
import { State } from '../geography/entities/state.entity'
import { Locality } from '../geography/entities/localities.entity'

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  @Index()
  status: string

  @Column({ default: '' })
  @Index()
  name: string

  @Column({ nullable: true })
  ref: string

  @Column({ default: 'English' })
  language: string

  @Column({ type: 'text', default: '' })
  description: string

  @Column({ type: 'text', default: '' })
  notes: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  @Column({ default: '' })
  url: string

  @Column({ type: 'enum', array: true, enum: role, nullable: true })
  role: role

  @OneToMany(
    () => KeywordsConsolidated,
    keywordsConsolidated => keywordsConsolidated.article
  )
  keywords: KeywordsConsolidated[]

  @Column({ type: 'enum', array: true, enum: formalism, nullable: true })
  formalism: formalism

  @Column({ default: '' })
  publication_type: string

  @Column({ nullable: true })
  asset_version: string

  @Column({ nullable: true })
  asset_maturity: string

  @Column({ default: true })
  geography: string

  @ManyToMany(
    type => PanCountry,
    panCountry => panCountry.article
  )
  @JoinTable()
  pan_countries: PanCountry[]

  @ManyToMany(
    type => Country,
    country => country.article
  )
  @JoinTable()
  countries: Country[]

  @ManyToMany(
    type => Region,
    region => region.article
  )
  @JoinTable()
  regions: Region[]

  @ManyToMany(
    type => State,
    state => state.article
  )
  @JoinTable()
  state_or_provinces: State[]

  @ManyToMany(
    type => Locality,
    locality => locality.article
  )
  @JoinTable()
  localities: Locality[]

  @Column({ type: 'enum', array: true, enum: categories, nullable: true })
  categories: categories

  @ManyToOne(() => UserEntity, { eager: true, cascade: true })
  author: UserEntity

  @ManyToMany(
    type => List,
    list => list.articles
  )
  listIds: List[]

  @ManyToMany(
    type => Activity,
    activities => activities.articles
  )
  activities: Activity[]

  @ManyToOne(() => Organization, { cascade: true })
  organization: Organization

  @OneToMany(
    () => ArticleCurator,
    article_curator => article_curator.article
  )
  article_curator: ArticleCurator[]
}
