import { Contact } from '../contact/contact.entity'
import { categories, formalism, role } from '../enums'
import { UserEntity } from '../user/user.entity'

export interface ArticleInterface {
  id: number
  status: string
  formalism: formalism
  publication_type: string
  name: string
  ref: string
  language: string
  description: string
  authors: string[]
  created: Date
  url: string
  updated: Date
  role: role
  keywords: string[]
  categories: categories
  notes: string
  asset_version: string
  asset_maturity: string
  geography: string
  organization?: {
    id: number
    name: string
    type: string
    description: string
    keywords: string[]
    contacts: Contact[]
  }
  curators?: {
    organization: {
      id: number
      name: string
      type: string
      description: string
      keywords: string[]
      contacts: Contact[]
    }
    valuation: string
  }[]
  author: UserEntity
}
