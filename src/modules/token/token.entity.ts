import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { ArticleCurator } from '../article/article_curator.entity'
import { Article } from '../article/article.entity'
import { Contact } from '../contact/contact.entity'
import { UserEntity } from '../user/user.entity'

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  refreshToken: string

  @Column()
  expirationDate: Date

  @ManyToOne(
    type => UserEntity,
    user => user.token,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'userId' })
  user: UserEntity
}
