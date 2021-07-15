import { IsOptional, IsString } from 'class-validator'
import { Activity } from '../activity/activity.entity'
import { Article } from '../article/article.entity'
import { UserEntity } from '../user/user.entity'

export class CreateListDTO {
  creator: UserEntity
  articles: Article[]
  activities: Activity[]
  name: string
  description: string
}

export class UpdateListDTO {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  articles: number[]

  @IsOptional()
  activities: number[]
}
