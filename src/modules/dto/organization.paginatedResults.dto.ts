import { Contact } from '../contact/contact.entity'
import { Keyword } from '../keywords/keywords.entity'
import { Organization } from '../organization/organization.entity'

export class PaginatedOrganizationResultDto {
  data: Organization[]
  page: number
  limit: number
  sortName: string
  sortType: string
  totalCount: number
  allCount: number
}

export class OrganizationResultDTO {
  id: number
  name: string
  type: string
  description: string
  keywords: string[]
  contacts: Contact[]
}
