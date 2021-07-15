import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Equal, In, Not, Repository } from 'typeorm'
import { Contact } from '../contact/contact.entity'
import { PaginationSearchDto } from '../dto/pagination.dto'
import {
  OrganizationResultDTO,
  PaginatedOrganizationResultDto,
} from '../dto/organization.paginatedResults.dto'

import { Organization } from './organization.entity'
import { KeywordsService } from '../keywords/keywords.service'
import { Activity } from '../activity/activity.entity'
import { ActivityDTO } from '../activity/activity.interfaces'
import { ActivityOrganization } from '../activity/activity_organizrtion.entity'
import { ArticleCurator } from '../article/article_curator.entity'
import { Article } from '../article/article.entity'
import { AssetDTO } from '../dto/asset.dto'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { OrganizationDTO } from './organization.interface'

@Injectable()
export class OrganizationService {
  constructor(
    private readonly keywordService: KeywordsService,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(ActivityOrganization)
    private readonly activityOrganizationRepository: Repository<
      ActivityOrganization
    >,
    @InjectRepository(ArticleCurator)
    private readonly articleCuratorRepository: Repository<ArticleCurator>,
    @InjectRepository(KeywordsConsolidated)
    private readonly keywordsConsolidatedRepository: Repository<
      KeywordsConsolidated
    >
  ) {}

  static buildOrganizationToResponce(
    organization: Organization
  ): OrganizationResultDTO {
    return {
      ...organization,
      keywords: organization.keywords
        ? organization.keywords.map(item => item.keyword.keyword)
        : [],
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    const organizations = await this.organizationRepository
      .createQueryBuilder('organizations')
      .orderBy('organizations.name', 'ASC')
      .getMany()
    return organizations
  }

  async getPaginatedOrganizations(
    paginationDto: PaginationSearchDto
  ): Promise<PaginatedOrganizationResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    const organizations = this.organizationRepository
      .createQueryBuilder('organizations')
      .leftJoinAndSelect('organizations.keywords', 'keywordsConsolidated')
      .leftJoinAndSelect('keywordsConsolidated.keyword', 'keyword')
      .where({ type: Not(Equal('Hidden')) })
      .skip(skippedItems)
      .take(paginationDto.limit)
      .orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )

    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'name') {
        where = 'LOWER(organizations.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'type') {
        where = 'LOWER(organizations.type) like LOWER(:searchString)'
      }
      if (where) {
        organizations.andWhere(where, parameters)
      }
      if (paginationDto.searchBy === 'keyword') {
        if (Array.isArray(paginationDto.searchString)) {
          paginationDto.searchString.forEach(keyword => {
            organizations.andWhere(
              'keyword.keyword like LOWER(:searchString)',
              {
                searchString: `%${keyword}%`,
              }
            )
          })
        } else {
          organizations.andWhere('keyword.keyword like LOWER(:searchString)', {
            searchString: `%${paginationDto.searchString}%`,
          })
        }
      }
    }

    let org = await organizations.getManyAndCount()

    return {
      totalCount: org[1],
      allCount: org[1],
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: org[0],
    }
  }

  async getOrganization(id: number): Promise<OrganizationResultDTO> {
    const organization = await this.organizationRepository.findOne(id, {
      relations: ['contacts'],
    })

    const keywords = await this.keywordsConsolidatedRepository.find({
      where: {
        organization: organization,
      },
      relations: ['keyword'],
    })

    organization.keywords = keywords

    return OrganizationService.buildOrganizationToResponce(organization)
  }

  async createOrganization(
    organization: OrganizationDTO
  ): Promise<Organization> {
    const foundOrganization = await this.organizationRepository.find({
      where: { name: organization.data.name },
    })

    if (!foundOrganization.length) {
      const saved = await this.organizationRepository.save(organization.data)

      await this.keywordService.saveKeywords(
        organization.keywords,
        saved,
        'organization'
      )

      return saved
    }
    throw new BadRequestException('Organization with this name already exists')
  }

  async updateOrganization(
    id: number,
    organization: OrganizationDTO
  ): Promise<Organization> {
    const orgToUpdate = await this.organizationRepository.findOne(id, {
      relations: ['contacts'],
    })

    if (orgToUpdate.name !== organization.data.name) {
      const existing = await this.organizationRepository.findOne({
        name: organization.data.name,
      })

      if (existing) {
        throw new BadRequestException(
          'Organization with this name already exists'
        )
      }
    }
    const contactsToCreate = []

    organization.data.contacts.forEach(contact => {
      if (!contact.id) {
        contactsToCreate.push(contact)
      }
    })

    for (const c of contactsToCreate) {
      await this.contactRepository.save(c)
    }

    const organizationToSave = {
      ...orgToUpdate,
      ...organization.data,
    }

    const saved = await this.organizationRepository.save(organizationToSave)

    await this.keywordService.saveKeywords(
      organization.keywords,
      saved,
      'organization'
    )

    return saved
  }

  async deleteOrganization(id: number): Promise<Organization> {
    const org = await this.organizationRepository.findOne(id)
    return await this.organizationRepository.remove(org)
  }

  async saveCurators(saved: Article, article: AssetDTO): Promise<void> {
    const curatorsToSave = []
    await this.articleCuratorRepository.delete({ article: saved })

    if (article.curators && article.curators.length) {
      const names = article.curators
        .filter(
          item =>
            !item.organization.id && item.organization.name.trim().length > 0
        )
        .map(item => item.organization.name)

      const ids = article.curators
        .map(item => item.organization.id)
        .filter(item => item)

      if (names.length) {
        const Names = [...names]
        const curators = await this.organizationRepository.find({
          where: { name: In(Names) },
          select: ['name'],
        })

        if (curators.length) {
          throw new BadRequestException(curators[0].name + ' already exists')
        }

        for (const name of Names) {
          const curatorToSave = article.curators.filter(
            curator => curator.organization.name === name
          )[0]
          const savedCurator = await this.organizationRepository.save(
            curatorToSave.organization
          )

          await this.keywordService.saveKeywords(
            curatorToSave.keywords,
            savedCurator,
            'organization'
          )
        }
      }

      let orgByNames
      let orgByIds

      if (names.length) {
        orgByNames = await this.organizationRepository.find({
          name: In(names),
        })
      }
      if (ids.length) {
        orgByIds = await this.organizationRepository.find({
          id: In(ids),
        })
      }

      if (orgByIds) {
        orgByIds.forEach(item => {
          curatorsToSave.push(item)
        })
      }

      if (orgByNames) {
        for (const curator of orgByNames) {
          let existing = false

          if (orgByIds) {
            for (const item of orgByIds) {
              if (item.id === curator.id) {
                existing = true
                break
              }
            }
          }

          if (!existing) {
            curatorsToSave.push(curator)
          }
        }
      }

      const array = []
      article.curators.forEach(item => {
        const curator = curatorsToSave.filter(
          cur =>
            item.organization.id === cur.id ||
            item.organization.name === cur.name
        )
        if (curator.length) {
          array.push({
            article: saved,
            curator: curator[0],
            valuation: item.valuation,
          })
        }
      })

      if (array.length) {
        await this.articleCuratorRepository.save(array)
      }
    }
  }

  async saveActivityOrganizations(
    saved: Activity,
    activity: ActivityDTO
  ): Promise<void> {
    const array = []

    await this.activityOrganizationRepository.delete({ activity: saved })

    if (activity.organizations && activity.organizations.length) {
      const names = activity.organizations
        .filter(
          item =>
            !item.organization.id && item.organization.name.trim().length > 0
        )
        .map(item => item.organization.name)

      const ids = activity.organizations
        .map(item => item.organization.id)
        .filter(item => item)

      if (names.length) {
        const Names = [...names]
        const organizations = await this.organizationRepository.find({
          name: In(Names),
        })

        if (organizations.length) {
          throw new BadRequestException(
            organizations[0].name + ' already exists'
          )
        }

        for (const name of Names) {
          const organizationToSave = activity.organizations.filter(
            organization => organization.organization.name === name
          )[0]
          const savedActivityOrg = await this.organizationRepository.save(
            organizationToSave.organization
          )

          await this.keywordService.saveKeywords(
            organizationToSave.keywords,
            savedActivityOrg,
            'organization'
          )
        }
      }

      let orgByNames
      let orgByIds
      const organizationsToSave = []

      if (names.length) {
        orgByNames = await this.organizationRepository.find({
          name: In(names),
        })
      }
      if (ids.length) {
        orgByIds = await this.organizationRepository.find({
          id: In(ids),
        })
      }

      if (orgByIds) {
        orgByIds.forEach(item => {
          organizationsToSave.push(item)
        })
      }

      if (orgByNames) {
        for (const curator of orgByNames) {
          let existing = false

          if (orgByIds) {
            for (const item of orgByIds) {
              if (item.id === curator.id) {
                existing = true
                break
              }
            }
          }

          if (!existing) {
            organizationsToSave.push(curator)
          }
        }
      }

      activity.organizations.forEach(item => {
        const organization = organizationsToSave.filter(
          org =>
            item.organization.id === org.id ||
            item.organization.name === org.name
        )
        if (organization.length) {
          array.push({
            activity: saved,
            organization: organization[0],
            owner: item.owner,
          })
        }
      })
    }
    if (array.length) {
      await this.activityOrganizationRepository.save(array)
    }
  }
}
