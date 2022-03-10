import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('journals')
export class ArticleJournal {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name?: string
}