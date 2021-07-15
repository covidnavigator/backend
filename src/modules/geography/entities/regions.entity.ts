import { Article } from '../../article/article.entity'
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('region')
export class Region {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false, default: '' })
  region: string

  @ManyToMany(
    type => Article,
    article => article.regions
  )
  article: Article[]
}
