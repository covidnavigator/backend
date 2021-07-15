import { Article } from '../../article/article.entity'
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'

@Entity('state')
export class State {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', nullable: false, default: '' })
  state: string

  @ManyToMany(
    type => Article,
    article => article.state_or_provinces
  )
  article: Article[]
}
