import { Article } from '../../article/article.entity'
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false, default: '' })
  country: string

  @ManyToMany(
    type => Article,
    article => article.countries
  )
  article: Article[]
}
