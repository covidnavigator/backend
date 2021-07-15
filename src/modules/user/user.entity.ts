import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from 'typeorm'
import { IsEmail } from 'class-validator'
import { Exclude, classToPlain } from 'class-transformer'
import * as bcrypt from 'bcryptjs'
import { Article } from '../article/article.entity'
import { List } from '../list/list.entity'
import { Roles } from '../roles/roles.entity'
import { Token } from '../token/token.entity'
import { Activity } from '../activity/activity.entity'

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'boolean', default: true })
  active: boolean

  @Column({ type: 'boolean', default: true })
  confirmed: boolean

  @Column({ default: '' })
  organization: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column()
  @IsEmail()
  email: string

  @Column()
  username: string

  @ManyToOne(() => Roles, { eager: true, cascade: true })
  role: Roles

  @OneToMany(
    type => Article,
    article => article.author
  )
  posts: Article[]

  articlesCount: number

  @OneToMany(
    type => Activity,
    activity => activity.author
  )
  activities: Activity[]

  activitiesCount: number

  @OneToMany(
    type => List,
    list => list.creator
  )
  lists: List[]

  @OneToMany(
    type => Token,
    token => token.user,
    { cascade: true }
  )
  token: Token[]

  @Column()
  @Exclude()
  password: string

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password)
  }

  toJSON() {
    return classToPlain(this)
  }
}
