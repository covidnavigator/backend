import { IsOptional } from 'class-validator'

export class PaginationDto {
  page: number
  limit: number
  sortName: string
  sortType: string
}

export class PaginationSearchDto extends PaginationDto {
  @IsOptional()
  searchString: string | Array<string>

  @IsOptional()
  searchBy: string
}

export class Dates {
  startDate: Date
  endDate: Date
}
