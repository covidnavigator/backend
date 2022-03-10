import { Injectable, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, In, Not, Equal, Brackets } from 'typeorm'

import { Article } from './article.entity'
import { ArticleInterface } from './article.interfaces'
import { UserEntity } from '../user/user.entity'

import { AssetDTO, AssetInterfaceDTO, ExternalSources } from '../dto/asset.dto'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { PaginatedArticlesResultDto } from '../dto/article.paginatedResults.dto'
import { Organization } from '../organization/organization.entity'
import { ArticleCurator } from './article_curator.entity'
import { KeywordsService } from '../keywords/keywords.service'
import { addHTTPSProtocol } from '../../utils/utils'
import { OrganizationService } from '../organization/organization.service'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { GeographyService } from '../geography/geography.service'
import { PermissionsService } from '../permissions/permissions.service'
import { ArticleJournal } from './article_journal.entity';
import { ArticleExternalSources } from './article_external_sources.entity';

@Injectable()
export class ArticleService {
  constructor(
    private readonly keywordService: KeywordsService,
    private readonly permissionService: PermissionsService,
    private readonly organizationService: OrganizationService,
    private readonly geographyService: GeographyService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(ArticleCurator)
    private readonly articleCuratorRepository: Repository<ArticleCurator>,
    @InjectRepository(KeywordsConsolidated)
    private readonly keywordsConsolidatedRepository: Repository<KeywordsConsolidated>,
    @InjectRepository(ArticleJournal)
    private readonly articleJournalsRepository: Repository<ArticleJournal>,
    @InjectRepository(ArticleExternalSources)
    private readonly articleExternalSourceRepository: Repository<ArticleExternalSources>,
  ) {
  }

  static articleToResponseObject(article: Article): ArticleInterface {
    const responseObject = {
      id: article.id,
      status: article.status,
      formalism: article.formalism,
      publication_type: article.publication_type,
      name: article.name,
      ref: article.ref,
      language: article.language,
      description: article.description,
      authors: article.authors,
      created: article.created,
      url: article.url,
      updated: article.updated,
      published_date: article.published_date,
      role: article.role,
      categories: article.categories,
      notes: article.notes,
      asset_version: article.asset_version,
      asset_maturity: article.asset_maturity,
      geography: article.geography,
      organization: article.organization && {
        id: article.organization.id,
        name: article.organization.name,
        description: article.organization.description,
        type: article.organization.type,
        contacts: article.organization.contacts,
        keywords: article.organization.keywords
          ? article.organization.keywords.map(kc => kc.keyword.keyword)
          : [],
      },
      curators: article.article_curator
        ? article.article_curator.map(ao => {
            return {
              organization: {
                id: ao.curator.id,
                name: ao.curator.name,
                description: ao.curator.description,
                type: ao.curator.type,
                contacts: ao.curator.contacts,
                keywords: ao.curator.keywords
                  ? ao.curator.keywords.map(kc => kc.keyword.keyword)
                  : [],
              },
              valuation: ao.valuation,
            }
          })
        : [],
      keywords: article.keywords
        ? article.keywords.map(item => item.keyword.keyword)
        : [],
      countries: article.countries
        ? article.countries.map(item => item.country)
        : [],
      pan_countries: article.pan_countries
        ? article.pan_countries.map(item => item.panCountry)
        : [],
      regions: article.regions ? article.regions.map(item => item.region) : [],
      localities: article.localities
        ? article.localities.map(item => item.locality)
        : [],
      state_or_provinces: article.state_or_provinces
        ? article.state_or_provinces.map(item => item.state)
        : [],
      author: article.author,
      journal: article.journal,
      external_sources: article.external_sources
        ? article.external_sources.map(es => {
          return {
            external_name: es.external_name,
            external_ids: es.external_ids,
          }
        })
        : [],
    }

    return responseObject
  }

  async getCount(user: UserEntity): Promise<number> {
    if (user.role.role === 'Superuser') {
      return await this.articleRepository.count()
    } else if (user.role.permissions) {
      if (this.permissionService.checkPermissions(user, 'DRAFTS_VIEW')) {
        return await this.articleRepository.count()
      } else {
        return await this.articleRepository.count({
          where: [{ status: Not(Equal('Draft')) }, { author: user }],
        })
      }
    }
  }

  async getPaginatedArticles(
    status: undefined | string,
    user: UserEntity,
    paginationDto: PaginationSearchDto
  ): Promise<PaginatedArticlesResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    const request = this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.status',
        'article.name',
        'article.created',
        'article.publication_type',
        'author.username',
      ])
      .leftJoin('article.author', 'author')
      .leftJoin('article.organization', 'organization')
      .leftJoin('article.keywords', 'keywordsConsolidated')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .skip(skippedItems)
      .take(paginationDto.limit)

    if (paginationDto.sortName) {
      request.orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )
    } else {
      request.orderBy('article.id', 'DESC')
    }

    if (status === 'all' || status === 'All') {
      if (
        !this.permissionService.checkPermissions(user, 'DRAFTS_VIEW') &&
        user.role.role !== 'Superuser'
      ) {
        request.andWhere(
          new Brackets(qb => {
            qb.where(`article.status <> 'Draft'`)
            qb.orWhere('author.id = :id', {
              id: user.id,
            })
          })
        )
      }
    } else if (status !== 'all' && status !== 'All') {
      request.andWhere(`article.status = '${status}'`)
    }
    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where = 'LOWER(article.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'organization') {
        where = 'LOWER(organization.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'contributor') {
        where = 'LOWER(author.username) like LOWER(:searchString)'
      }
      if (where) {
        request.andWhere(where, parameters)
      }
      if (paginationDto.searchBy === 'keyword') {
        if (Array.isArray(paginationDto.searchString)) {
          paginationDto.searchString.forEach(keyword => {
            request.andWhere('keyword.keyword like LOWER(:searchString)', {
              searchString: `%${keyword}%`,
            })
          })
        } else {
          request.andWhere('keyword.keyword like LOWER(:searchString)', {
            searchString: `%${paginationDto.searchString}%`,
          })
        }
      }
    }

    let articles = await request.getManyAndCount()

    // console.log(articles)

    return {
      // totalCount: 0,
      // data: [],
      totalCount: articles[1],
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: articles[0].map(article =>
        ArticleService.articleToResponseObject(article)
      ),
    }
  }

  async getPaginatedArticlesByIds(
    user: UserEntity,
    paginationDto: PaginationSearchDto,
    status: string
  ): Promise<PaginatedArticlesResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    let articles = []

    const request = this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.status',
        'article.name',
        'article.created',
        'article.publication_type',
        'author.username',
      ])
      .leftJoin('article.author', 'author')
      .leftJoin('article.organization', 'organization')
      .leftJoin('article.keywords', 'keywordsConsolidated')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .where('author.id = :id', {
        id: user.id,
      })
      .skip(skippedItems)
      .take(paginationDto.limit)
      .orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )

    if (status === 'all') {
      if (
        !this.permissionService.checkPermissions(user, 'DRAFTS_VIEW') ||
        user.role.role !== 'Superuser'
      ) {
        request.andWhere(`article.status <> 'Draft'`)
        request.orWhere('author.id = :id', {
          id: user.id,
        })
      }
    } else if (status !== 'all') {
      request.andWhere(`article.status = '${status}'`)
    }
    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where = 'LOWER(article.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'organization') {
        where = 'LOWER(organization.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'contributor') {
        where = 'LOWER(author.username) like LOWER(:searchString)'
      }
      if (where) {
        request.andWhere(where, parameters)
      }
      if (paginationDto.searchBy === 'keyword') {
        if (Array.isArray(paginationDto.searchString)) {
          paginationDto.searchString.forEach(keyword => {
            request.andWhere('keyword.keyword like LOWER(:searchString)', {
              searchString: `%${keyword}%`,
            })
          })
        } else {
          request.andWhere('keyword.keyword like LOWER(:searchString)', {
            searchString: `%${paginationDto.searchString}%`,
          })
        }
      }
    }

    articles = await request.getManyAndCount()

    return {
      totalCount: articles[1],
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: articles[0].map(article =>
        ArticleService.articleToResponseObject(article)
      ),
    }
  }

  async getArticle(id: number): Promise<ArticleInterface> {
    const data = await this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.id',
        'article.status',
        'article.name',
        'article.ref',
        'article.language',
        'article.description',
        'article.authors',
        'article.notes',
        'article.created',
        'article.published_date',
        'article.url',
        'article.role',
        'article.formalism',
        'article.publication_type',
        'article.asset_version',
        'article.asset_maturity',
        'article.geography',
        'article.categories',
        'ac.valuation',
        'keywordsConsolidated.id',
        'kc.id',
        'keyword.keyword',
        'key.keyword',
        'pan_countries.panCountry',
        'countries.country',
        'regions.region',
        'state_or_provinces.state',
        'locality.locality',
        'author.username',
        'author.id',
        'journal.id',
        'journal.name'
      ])
      .leftJoin('article.article_curator', 'ac')
      .leftJoinAndSelect('article.external_sources', 'ex')
      .leftJoinAndSelect('ac.curator', 'curator')
      .leftJoinAndSelect('article.organization', 'organization')
      .leftJoinAndSelect('organization.contacts', 'contacts')
      .leftJoin('article.author', 'author')
      .leftJoin('article.journal', 'journal')
      .leftJoin('article.localities', 'locality')
      .leftJoin('article.state_or_provinces', 'state_or_provinces')
      .leftJoin('article.regions', 'regions')
      .leftJoin('article.countries', 'countries')
      .leftJoin('article.pan_countries', 'pan_countries')
      .leftJoin('article.keywords', 'keywordsConsolidated')
      .leftJoin('organization.keywords', 'kc')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .leftJoin('kc.keyword', 'key')
      .where('article.id = :id', { id: id })
      .getOne()

    return ArticleService.articleToResponseObject(data)
  }

  async createArticle(article: AssetDTO): Promise<Article> {
    article.data.url = addHTTPSProtocol(article.data.url)
    const foundArticle = await this.articleRepository.count({
      where: { url: article.data.url },
    })

    let savedOrganization

    if (foundArticle) {
      throw new BadRequestException('Asset with this URL already exists')
    }

    if (!article.organization.data.id) {
      const foundOrganization = await this.organizationRepository.count({
        where: {
          name: article.organization.data.name,
        },
      })
      if (foundOrganization) {
        throw new BadRequestException(
          article.organization.data.name + ' already exists'
        )
      } else {
        savedOrganization = await this.organizationRepository.save(
          article.organization.data
        )
      }
    }

    savedOrganization = await this.organizationRepository.findOne({
      id: article.organization.data.id,
    })

    if (savedOrganization) {
      article.data.organization = savedOrganization
      await this.keywordService.saveKeywords(
        article.organization.keywords,
        savedOrganization,
        'organization'
      )
    }

    if (article.data.journal) {
      const journalSavedId = await this.saveArticleJournal(article.data.journal)
      article.data.journal = journalSavedId;
    }

    const saved = await this.articleRepository.save(article.data)

    await this.saveExternalSources(saved, article);

    await this.organizationService.saveCurators(saved, article)

    await this.geographyService.saveGeography(article.geography, saved)

    await this.keywordService.saveKeywords(article.keywords, saved, 'article')

    return saved
  }

  async updateArticle(id: number, updatedArticle: AssetDTO): Promise<Article> {
    const foundArticle = await this.articleRepository.findOne(id)

    if (!updatedArticle.data.url && updatedArticle.data.status) {
      await this.articleRepository.update(id, updatedArticle.data)
      return await this.articleRepository.findOne(id)
    }

    updatedArticle.data.url = addHTTPSProtocol(updatedArticle.data.url)
    if (foundArticle.url !== updatedArticle.data.url) {
      const existing = await this.articleRepository.count({
        where: { url: updatedArticle.data.url },
      })

      if (existing) {
        throw new BadRequestException('Asset with this URL already exists')
      }
    }

    let savedOrganization

    if (!updatedArticle.organization.data.id) {
      const foundOrganization = await this.organizationRepository.count({
        where: {
          name: updatedArticle.organization.data.name,
        },
      })
      if (foundOrganization) {
        throw new BadRequestException(
          updatedArticle.organization.data.name + ' already exists'
        )
      } else {
        savedOrganization = await this.organizationRepository.save(
          updatedArticle.organization.data
        )

        await this.keywordService.saveKeywords(
          updatedArticle.organization.keywords,
          savedOrganization,
          'organization'
        )
      }
    }

    savedOrganization = await this.organizationRepository.findOne({
      id: updatedArticle.organization.data.id,
    })

    if (savedOrganization) {
      updatedArticle.data.organization = savedOrganization
    }

    if (updatedArticle.data.journal) {
      const journalSavedId = await this.saveArticleJournal(updatedArticle.data.journal)
      updatedArticle.data.journal = journalSavedId;
    }

    const newArticle = await this.articleRepository.findOne(id)

    const toUpdate = {
      ...newArticle,
      ...updatedArticle.data,
    }

    const saved = await this.articleRepository.save(toUpdate)

    await this.organizationService.saveCurators(saved, updatedArticle)

    await this.geographyService.saveGeography(updatedArticle.geography, saved)

    await this.keywordService.saveKeywords(
      updatedArticle.keywords,
      saved,
      'article'
    )

    await this.saveExternalSources(saved, updatedArticle);

    return saved
  }

  async deleteArticle(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne(id)
    return await this.articleRepository.remove(article)
  }

  async getArticleJournals(): Promise<ArticleJournal[]> {
    const journals = await this.articleJournalsRepository.createQueryBuilder(
      `journals`).orderBy('name', 'ASC').getRawMany();
    return journals;
  }

  async saveArticleJournal(journal): Promise<ArticleJournal> {
    if (journal.selected.id) {
      return { id: journal.selected.id };
    } else if (journal.name !== '' && !journal.selected.id) {
      const newJournal = await this.articleJournalsRepository.save({ name: journal.name });
      return { id: newJournal.id }
    } else {
      return null;
    }
  }

  async saveExternalSources(saved: Article, article: AssetDTO): Promise<void> {
    await this.articleExternalSourceRepository.delete({ article: saved })

    const array = []
      article.external_sources.forEach(source => {
        if (source.external_name !== '' && source.external_ids !== '')
        array.push({
          external_name: source.external_name,
          external_ids: source.external_ids,
          articleId: saved.id,
        })
    })

    if (array.length) {
      await this.articleExternalSourceRepository.save(array)
    }
  }

  async getExternalSources(): Promise<ExternalSources[]> {
    const request = await this.articleExternalSourceRepository
      .createQueryBuilder('article_external_sources')
      .select('DISTINCT ("external_name")').where(`external_name != ''`).getRawMany();

    return request;
  }
}
