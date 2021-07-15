import { ArticleInterface } from '../article/article.interfaces'
import { Contact } from '../contact/contact.entity'
import { Organization } from '../organization/organization.entity'
import { UserEntity } from '../user/user.entity'
import { Activity } from './activity.entity'
import { activityKnowledge, categories } from '../enums'
import { Keyword } from '../keywords/keywords.entity'

export class ActivityDetails {
  id: number
  status: string
  name: string
  shortDescription: string
  description: string
  url: string
  created: Date
  keywords: string[]
  knowledgeStages: activityKnowledge
  categories: categories
  related: ActivityDetails[]
  articles: ArticleInterface[]
  contacts: Contact[]
  activity_organization?: {
    organization: {
      id: number
      name: string
      type: string
      description: string
      keywords: string[]
      contacts: Contact[]
    }
    owner: boolean
  }[]
  author: UserEntity
}

export interface PaginatedActivities {
  page: number
  limit: number
  sortName: string
  sortType: string
  totalCount: number
}

export interface PaginatedActivitiesResultDto extends PaginatedActivities {
  data: ActivityDetails[]
}

export interface ActivityDTO {
  data: Activity
  organizations: Organizations[]
  keywords: Keyword[]
}

class Organizations {
  organization: Organization
  owner: boolean
  keywords: Keyword[]
}
