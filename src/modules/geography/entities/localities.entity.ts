import { Article } from '../../article/article.entity'
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm'

@Entity('locality')
export class Locality {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false, default: '' })
  locality: string

  @ManyToMany(
    type => Article,
    article => article.localities
  )
  article: Article[]
}
