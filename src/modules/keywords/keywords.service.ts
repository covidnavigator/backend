import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Activity } from '../activity/activity.entity'
import { Article } from '../article/article.entity'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { Organization } from '../organization/organization.entity'
import { Keyword } from './keywords.entity'
import { KeywordsConsolidated } from './keywordsConsolidated.entity'

@Injectable()
export class KeywordsService {
  constructor(
    @InjectRepository(Keyword)
    private readonly keywordsRepository: Repository<Keyword>,
    @InjectRepository(KeywordsConsolidated)
    private readonly keywordsConsolidatedRepository: Repository<
      KeywordsConsolidated
    >
  ) {}

  async getKeywords(): Promise<Keyword[]> {
    return await this.keywordsRepository.find({
      order: {
        keyword: 'ASC',
      },
    })
  }

  async getPaginatedKeywords(
    paginationDto: PaginationSearchDto
  ): Promise<Keyword[]> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    const request = this.keywordsRepository
      .createQueryBuilder('keyword')
      .skip(skippedItems)
      .take(paginationDto.limit)

    if (paginationDto.sortName) {
      request.orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )
    } else {
      request.orderBy('keyword.id', 'DESC')
    }

    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where = 'LOWER(keyword.keyword) like LOWER(:searchString)'
      }
      if (where) {
        request.andWhere(where, parameters)
      }
    }

    return await request.getMany()
  }

  async saveKeywords(
    keywords: Keyword[],
    entity: Activity | Article | Organization,
    type: string
  ): Promise<void> {
    if (keywords && keywords.length) {
      const nonActualRecords = await this.keywordsConsolidatedRepository.find({
        where: { [type]: entity },
      })

      if (nonActualRecords.length) {
        for (const nonActualRecord of nonActualRecords) {
          await this.keywordsConsolidatedRepository.save({
            ...nonActualRecord,
            [type]: null,
          })
        }
      }
    }

    if (keywords && keywords.length) {
      for (const keyword of keywords) {
        let isKeywordExist = await this.keywordsRepository.findOne(keyword)

        if (!isKeywordExist) {
          isKeywordExist = await this.keywordsRepository.save(keyword)
        }

        const existingRecord = await this.keywordsConsolidatedRepository.find({
          where: { keyword: isKeywordExist },
          relations: ['article', 'organization', 'activity'],
        })

        let propperRecord
        for (const existing of existingRecord) {
          if (!existing[type]) {
            propperRecord = existing
          } else {
            propperRecord = false
          }
        }

        if (propperRecord) {
          await this.keywordsConsolidatedRepository.save({
            ...propperRecord,
            [type]: entity,
          })
        } else {
          await this.keywordsConsolidatedRepository.save({
            keyword: isKeywordExist,
            [type]: entity,
          })
        }
      }
    }

    await this.keywordsConsolidatedRepository.delete({
      activity: null,
      article: null,
      organization: null,
    })
    await this.keywordsConsolidatedRepository.delete({ keyword: null })
  }
}
