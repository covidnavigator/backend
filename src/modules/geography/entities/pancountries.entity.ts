import { Article } from '../../article/article.entity'
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('pancountry')
export class PanCountry {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false, default: '' })
  panCountry: string

  @ManyToMany(
    type => Article,
    article => article.pan_countries
  )
  article: Article[]
}
