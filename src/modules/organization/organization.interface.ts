import { Keyword } from '../keywords/keywords.entity'
import { Organization } from './organization.entity'

export interface OrganizationDTO {
  data: Organization
  keywords: Keyword[]
}
