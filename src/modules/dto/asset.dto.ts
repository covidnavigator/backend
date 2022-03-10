import { Article } from '../article/article.entity'
import { ArticleInterface } from '../article/article.interfaces'
import { categories, formalism, role } from '../enums'
import { Keyword } from '../keywords/keywords.entity'
import { Organization } from '../organization/organization.entity'
import { OrganizationDTO } from '../organization/organization.interface'
import { UserEntity } from '../user/user.entity'
import { Geography } from './geography.dto'

export class AssetDTO {
  data: Article
  organization: OrganizationDTO
  curators: Curators[]
  keywords: Keyword[]
  geography: Geography
  external_sources: ExternalSources[]
}

class Curators {
  organization: Organization
  valuation: string
  keywords: Keyword[]
}

export class AssetInterfaceDTO {
  data: ArticleInterface
  organization: Organization
  curators: Curators[]
}

export class ExternalSources {
  external_name: string
  external_ids: string
}
