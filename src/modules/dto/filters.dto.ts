import { IsOptional } from 'class-validator'
import { activityKnowledge, categories, formalism, role } from '../enums'

export class GraphFilters {
  category: categories
  role: string
  language: string
  searchFor: string

  @IsOptional()
  sourceType: string[]

  @IsOptional()
  formalism: string[]

  @IsOptional()
  maturity: string[]

  @IsOptional()
  publicationType: string[]

  @IsOptional()
  knowledgeStages: string[]

  @IsOptional()
  activityType: string[]
}
