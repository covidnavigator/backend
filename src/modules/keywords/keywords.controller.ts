import { Controller, Get, Query } from '@nestjs/common'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { Keyword } from './keywords.entity'
import { KeywordsService } from './keywords.service'

@Controller()
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @Get('keywords')
  getKeywords(@Query() paginationDto: PaginationSearchDto): Promise<Keyword[]> {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    if (paginationDto.page && paginationDto.limit) {
      console.log('get paginated keywords')
      return this.keywordsService.getPaginatedKeywords(paginationDto)
    } else {
      console.log('get keywords')
      return this.keywordsService.getKeywords()
    }
  }
}
