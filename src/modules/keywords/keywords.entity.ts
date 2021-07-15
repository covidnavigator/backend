import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { KeywordsConsolidated } from './keywordsConsolidated.entity'

@Entity('keyword')
export class Keyword {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text', default: '', nullable: false })
  keyword: string

  @OneToMany(
    () => KeywordsConsolidated,
    keywordsConsolidated => keywordsConsolidated.keyword
  )
  consolidated: KeywordsConsolidated[]
}
