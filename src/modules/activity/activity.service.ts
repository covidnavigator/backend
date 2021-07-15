import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
  Brackets,
  Equal,
  getConnection,
  In,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'
import { addHTTPSProtocol } from '../../utils/utils'
import { Article } from '../article/article.entity'
import { ArticleService } from '../article/article.service'
import { GraphFilters } from '../dto/filters.dto'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { KeywordsService } from '../keywords/keywords.service'
import { OrganizationService } from '../organization/organization.service'
import { PermissionsService } from '../permissions/permissions.service'
import { UserEntity } from '../user/user.entity'
import { Activity } from './activity.entity'
import {
  ActivityDetails,
  ActivityDTO,
  PaginatedActivitiesResultDto,
} from './activity.interfaces'

@Injectable()
export class ActivityService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly permissionService: PermissionsService,
    private readonly keywordService: KeywordsService,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>
  ) {}

  static mapRawActivities(data): any[] {
    const output = []

    const activities = new Map()
    const relatedArticles = new Map()
    const relatedActivities = new Map()

    data.forEach(element => {
      if (activities.has(element.activity_id)) {
        const exist = activities.get(element.activity_id)
        activities.set(element.activity_id, {
          ...exist,
          articles: [
            ...exist.articles,
            element.article_id ? element.article_id : 0,
          ],
          related: [
            ...exist.related,
            element.rel_activity_id ? element.rel_activity_id : 0,
          ],
        })
      } else {
        activities.set(element.activity_id, {
          id: element.activity_id,
          name: element.activity_name,
          shortDescription: element.activity_shortDescription,
          description: element.activity_description,
          url: element.activity_url,
          categories: element.activity_categories
            ? element.activity_categories
                .slice(1, -1)
                .split(',')
                .filter(item => item)
            : [],
          articles: [element.article_id ? element.article_id : 0],
          related: [element.rel_activity_id ? element.rel_activity_id : 0],
        })
      }

      if (
        element.rel_activity_id &&
        !relatedActivities.has(element.rel_activity_id)
      ) {
        relatedActivities.set(element.rel_activity_id, {
          id: element.rel_activity_id,
          name: element.rel_activity_name,
          description: element.rel_activity_description,
        })
      }

      if (!relatedArticles.has(element.article_id) && element.article_id) {
        relatedArticles.set(element.article_id, {
          id: element.article_id,
          name: element.article_name,
          description: element.article_description,
        })
      }
    })

    for (let [key, value] of activities) {
      let uniqArticles = [...new Set(value.articles.filter(id => id))]
      let uniqActivities = [...new Set(value.related.filter(id => id))]

      output.push({
        ...value,
        articles: uniqArticles.map(key => relatedArticles.get(key)),
        related: uniqActivities.map(key => relatedActivities.get(key)),
      })
    }

    return output
  }

  static buildActivityDetailsToResponceObject(
    activity: Activity
  ): ActivityDetails {
    return {
      ...activity,
      activity_organization: activity.activity_organization
        ? activity.activity_organization.map(ao => {
            return {
              organization: {
                id: ao.organization.id,
                name: ao.organization.name,
                description: ao.organization.description,
                type: ao.organization.type,
                contacts: ao.organization.contacts,
                keywords: ao.organization.keywords
                  ? ao.organization.keywords.map(kc => kc.keyword.keyword)
                  : [],
              },
              owner: ao.owner,
            }
          })
        : [],
      keywords: activity.keywords
        ? activity.keywords.map(kc => kc.keyword.keyword)
        : [],
      related: activity.related
        ? activity.related.map(activity =>
            ActivityService.buildActivityDetailsToResponceObject(activity)
          )
        : [],
      articles: activity.articles
        ? activity.articles.map(article =>
            ArticleService.articleToResponseObject(article)
          )
        : [],
    }
  }

  async getCount(user: UserEntity): Promise<number> {
    if (user.role.role === 'Superuser') {
      return await this.activityRepository.count()
    } else if (user.role.permissions) {
      if (this.permissionService.checkPermissions(user, 'DRAFTS_VIEW')) {
        return await this.activityRepository.count()
      } else {
        return await this.activityRepository.count({
          where: [{ status: Not(Equal('Draft')) }, { author: user }],
        })
      }
    }
  }

  async getGraphData(filters: GraphFilters): Promise<any> {
    const data = {
      activities: [],
      articles: [],
    }

    let assetsQuery = this.getAssetsQuery(filters)
    let activitiesQuery = this.getActivityQuery(filters)

    if (filters.searchFor === 'all') {
      const articles = await assetsQuery.getMany()
      const activities = await activitiesQuery.getRawMany()

      data.activities.push(...ActivityService.mapRawActivities(activities))
      data.articles.push(...articles)
    } else if (filters.searchFor === 'activities') {
      const activities = await activitiesQuery.getRawMany()
      data.activities.push(...ActivityService.mapRawActivities(activities))
    } else if (filters.searchFor === 'assets') {
      const articles = await assetsQuery.getMany()
      data.articles.push(...articles)
    }
    return data
  }

  getActivityQuery(filters: GraphFilters): SelectQueryBuilder<unknown> {
    let relatedAssets = this.getRelatedAssetsQuery(filters)
    let relatedActivities = this.getRelatedActivitiesQuery(filters)

    const query = this.activityRepository
      .createQueryBuilder('activity')
      .select([
        'activity.name',
        'activity.id',
        'activity.url',
        'activity.description',
        'activity.shortDescription',
        'activity.categories',
      ])
      .leftJoin('activity.articles', 'articles')
      .leftJoin('activity.related', 'related')
      .leftJoin('activity.activity_organization', 'ao')
      .leftJoin('ao.organization', 'organization')
      .leftJoinAndSelect(
        '(' + relatedAssets.getQuery() + ')',
        'relArticle',
        '"relArticle"."article_id" = activity_articles.articlesId'
      )
      .leftJoinAndSelect(
        '(' + relatedActivities.getQuery() + ')',
        'relActivity',
        '"relActivity"."rel_activity_id" = activity_related.activityId_2'
      )
      .andWhere(`activity.status = 'Verified'`)

    return this.addFiltersToActivityQuery(query, filters)
  }

  getRelatedActivitiesQuery(
    filters: GraphFilters
  ): SelectQueryBuilder<unknown> {
    const query = getConnection()
      .createQueryBuilder('activity_related_activity', 'related_activity')
      .select([
        'rel_activity.name',
        'rel_activity.description',
        'rel_activity.id',
      ])
      .leftJoin(
        'activity',
        'rel_activity',
        'related_activity.activityId_2 = rel_activity.id'
      )
      .leftJoin('rel_activity.activity_organization', 'ao')
      .leftJoin('ao.organization', 'organization')
      .where(`rel_activity.status = 'Verified'`)

    return this.addFiltersToActivitySubQuery(query, filters)
  }

  getAssetsQuery(filters: GraphFilters): SelectQueryBuilder<unknown> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .select([
        'article.name',
        'article.description',
        'article.id',
        'article.url',
        'article.created',
        'article.categories',
        'organization.name',
      ])
      .leftJoin('article.organization', 'organization')
      .andWhere(`article.status = 'Verified'`)

    return this.addFiltersToArticleQuery(query, filters)
  }

  getRelatedAssetsQuery(filters: GraphFilters): SelectQueryBuilder<unknown> {
    const query = getConnection()
      .createQueryBuilder('activity_articles_articles', 'related_articles')
      .select(['article.name', 'article.description', 'article.id'])
      .leftJoin(
        'articles',
        'article',
        'related_articles.articlesId = article.id'
      )
      .leftJoin('article.organization', 'organization')
      .andWhere(`article.status = 'Verified'`)

    return this.addFiltersToArticleQuery(query, filters)
  }

  addFiltersToArticleQuery(
    query: SelectQueryBuilder<unknown>,
    filters: GraphFilters
  ): SelectQueryBuilder<unknown> {
    if (filters.category) {
      query.andWhere(
        `article.categories @> ARRAY ['${filters.category}']::articles_categories_enum[]`
      )
    }

    if (filters.role) {
      query.andWhere(
        `article.role @> ARRAY ['${filters.role}']::articles_role_enum[]`
      )
    }

    if (filters.language) {
      query.andWhere(`article.language = '${filters.language}'`)
    }

    if (filters.formalism) {
      if (Array.isArray(filters.formalism)) {
        query.andWhere(
          new Brackets(qb => {
            filters.formalism.forEach(formalism => {
              qb.orWhere(
                `article.formalism @> ARRAY ['${formalism}']::articles_formalism_enum[]`
              )
            })
          })
        )
      } else {
        query.andWhere(
          `article.formalism @> ARRAY ['${filters.formalism}']::articles_formalism_enum[]`
        )
      }
    }

    if (filters.sourceType) {
      if (Array.isArray(filters.sourceType)) {
        query.andWhere(
          new Brackets(qb => {
            filters.sourceType.forEach(source => {
              qb.orWhere(`organization.type = '${source}'`)
            })
          })
        )
      } else {
        query.andWhere(`organization.type = '${filters.sourceType}'`)
      }
    }

    if (filters.maturity) {
      if (Array.isArray(filters.maturity)) {
        query.andWhere(
          new Brackets(qb => {
            filters.maturity.forEach(maturity => {
              qb.orWhere(`article.asset_maturity = '${maturity}'`)
            })
          })
        )
      } else {
        query.andWhere(`article.asset_maturity = '${filters.maturity}'`)
      }
    }

    if (filters.publicationType) {
      if (Array.isArray(filters.publicationType)) {
        query.andWhere(
          new Brackets(qb => {
            filters.publicationType.forEach(publicationType => {
              qb.orWhere(`article.publication_type = '${publicationType}'`)
            })
          })
        )
      } else {
        query.andWhere(
          `article.publication_type = '${filters.publicationType}'`
        )
      }
    }

    return query
  }

  addFiltersToActivityQuery(
    query: SelectQueryBuilder<Activity>,
    filters: GraphFilters
  ): SelectQueryBuilder<Activity> {
    if (filters.category) {
      query.andWhere(
        `activity.categories @> ARRAY ['${filters.category}']::activity_categories_enum[]`
      )
    }

    if (filters.sourceType) {
      if (Array.isArray(filters.sourceType)) {
        query.andWhere(
          new Brackets(qb => {
            filters.sourceType.forEach(source => {
              qb.orWhere(`organization.type = '${source}'`)
            })
          })
        )
      } else {
        query.andWhere(`organization.type = '${filters.sourceType}'`)
      }
    }

    if (filters.knowledgeStages) {
      if (Array.isArray(filters.knowledgeStages)) {
        query.andWhere(
          new Brackets(qb => {
            filters.knowledgeStages.forEach((knowledge, index) => {
              if (!index) {
                qb.orWhere(
                  `activity.knowledgeStages @> ARRAY ['${knowledge}']::activity_knowledgestages_enum[]`
                )
              }
            })
          })
        )
      } else {
        query.andWhere(
          `activity.knowledgeStages @> ARRAY ['${filters.knowledgeStages}']::activity_knowledgestages_enum[]`
        )
      }
    }

    return query
  }

  addFiltersToActivitySubQuery(
    query: SelectQueryBuilder<unknown>,
    filters: GraphFilters
  ): SelectQueryBuilder<unknown> {
    if (filters.sourceType) {
      if (Array.isArray(filters.sourceType)) {
        query.andWhere(
          new Brackets(qb => {
            filters.sourceType.forEach(source => {
              qb.orWhere(`organization.type = '${source}'`)
            })
          })
        )
      } else {
        query.andWhere(`organization.type = '${filters.sourceType}'`)
      }
    }

    if (filters.knowledgeStages) {
      if (Array.isArray(filters.knowledgeStages)) {
        new Brackets(qb => {
          filters.knowledgeStages.forEach(knowledge => {
            qb.orWhere(
              `rel_activity.knowledgeStages @> ARRAY ['${knowledge}']::activity_knowledgestages_enum[]`
            )
          })
        })
      } else {
        query.andWhere(
          `rel_activity.knowledgeStages @> ARRAY ['${filters.knowledgeStages}']::activity_knowledgestages_enum[]`
        )
      }
    }

    return query
  }

  async getPaginatedActivities(
    status: undefined | string,
    user: UserEntity,
    paginationDto: PaginationSearchDto
  ): Promise<PaginatedActivitiesResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    const request = this.activityRepository
      .createQueryBuilder('activity')
      .select([
        'activity.id',
        'activity.status',
        'activity.name',
        'activity.created',
        'activity.knowledgeStages',
        'author.username',
      ])
      .leftJoin('activity.author', 'author')
      .leftJoin('activity.keywords', 'keywordsConsolidated')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .skip(skippedItems)
      .take(paginationDto.limit)

    if (paginationDto.sortName) {
      request.orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )
    } else {
      request.orderBy('activity.id', 'DESC')
    }

    if (status === 'all' || status === 'All') {
      if (
        !this.permissionService.checkPermissions(user, 'DRAFTS_VIEW') &&
        user.role.role !== 'Superuser'
      ) {
        request.andWhere(
          new Brackets(qb => {
            qb.where(`activity.status <> 'Draft'`)
            qb.orWhere('author.id = :id', {
              id: user.id,
            })
          })
        )
      }
    } else if (status !== 'all' && status !== 'All') {
      request.andWhere(`activity.status = '${status}'`)
    }

    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where = 'LOWER(activity.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'knowledgeStages') {
        where = 'LOWER(activity.knowledgeStages) like LOWER(:searchString)'
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

    let data = await request.getManyAndCount()

    return {
      totalCount: data[1],
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: data[0].map(activity =>
        ActivityService.buildActivityDetailsToResponceObject(activity)
      ),
    }
  }

  async getProfileActivities(
    user: UserEntity,
    paginationDto: PaginationSearchDto,
    status: string | undefined
  ): Promise<PaginatedActivitiesResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit

    let activities = []

    const request = this.activityRepository
      .createQueryBuilder('activity')
      .select([
        'activity.id',
        'activity.status',
        'activity.name',
        'activity.created',
        'activity.knowledgeStages',
        'author.username',
      ])
      .leftJoin('activity.author', 'author')
      .leftJoin('activity.keywords', 'keywordsConsolidated')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .where('author.id = :id', {
        id: user.id,
      })
      .skip(skippedItems)
      .take(paginationDto.limit)

    if (paginationDto.sortName) {
      request.orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )
    } else {
      request.orderBy('activity.id', 'DESC')
    }
    if (status !== 'All') {
      request.andWhere('activity.status = :status', { status: status })
    }
    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where = 'LOWER(activity.name) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'knowledgeStages') {
        where = 'LOWER(activity.knowledgeStages) like LOWER(:searchString)'
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

    activities = await request.getManyAndCount()

    return {
      totalCount: activities[1],
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: paginationDto.page,
      limit: paginationDto.limit,
      data: activities[0],
    }
  }

  async getActivity(id: number): Promise<any> {
    const data = await this.activityRepository
      .createQueryBuilder('activity')
      .select([
        'activity.id',
        'activity.status',
        'activity.name',
        'activity.shortDescription',
        'activity.description',
        'activity.url',
        'activity.created',
        'activity.knowledgeStages',
        'activity.categories',
        'author.id',
        'author.username',
        'keywordsConsolidated.id',
        'article.id',
        'article.name',
        'article.status',
        'related.id',
        'related.name',
        'related.status',
        'ao.owner',
        'kc.id',
        'keyword.keyword',
        'key.keyword',
      ])
      .leftJoinAndSelect('activity.contacts', 'ac')
      .leftJoin('activity.activity_organization', 'ao')
      .leftJoinAndSelect('ao.organization', 'organization')
      .leftJoinAndSelect('organization.contacts', 'contacts')
      .leftJoin('activity.author', 'author')
      .leftJoin('activity.articles', 'article')
      .leftJoin('activity.related', 'related')
      .leftJoin('activity.keywords', 'keywordsConsolidated')
      .leftJoin('organization.keywords', 'kc')
      .leftJoin('keywordsConsolidated.keyword', 'keyword')
      .leftJoin('kc.keyword', 'key')
      .where('activity.id = :id', { id: id })
      .getOne()

    return ActivityService.buildActivityDetailsToResponceObject(data)
  }

  async createActivity(activity: ActivityDTO): Promise<Activity> {
    activity.data.url = addHTTPSProtocol(activity.data.url)

    const saved = await this.activityRepository.save(activity.data)

    if (activity.data.related && activity.data.related.length) {
      const ids = activity.data.related.map(activity => activity.id)
      const activities = await this.activityRepository.find({
        where: { id: In(ids) },
        relations: ['related'],
        select: ['id'],
      })

      if (activities.length) {
        for (const activity of activities) {
          activity.related.push(saved)
          await this.activityRepository.save(activity)
        }
      }
    }

    await this.organizationService.saveActivityOrganizations(saved, activity)

    await this.keywordService.saveKeywords(activity.keywords, saved, 'activity')

    return saved
  }

  async updateActivity(id: number, activity: ActivityDTO): Promise<Activity> {
    activity.data.url = addHTTPSProtocol(activity.data.url)

    if (
      !activity.data.name &&
      !activity.data.description &&
      activity.data.status
    ) {
      await this.activityRepository.update(id, activity.data)
      return await this.activityRepository.findOne(id)
    }

    let articles = []

    if (activity.data.articles && activity.data.articles.length) {
      const articleIds = []
      for (const article of activity.data.articles) {
        articleIds.push(article.id)
      }

      articles = await this.articleRepository.find({
        id: In(articleIds),
      })
    }

    const newActivity = await this.activityRepository.findOne({
      where: { id },
    })

    const toUpdate = {
      ...newActivity,
      ...activity.data,
      articles,
    }

    const saved = await this.activityRepository.save(toUpdate)

    await this.organizationService.saveActivityOrganizations(saved, activity)
    if (activity.data.related && activity.data.related.length) {
      const ids = activity.data.related.map(activity => activity.id)

      const activities = await this.activityRepository.find({
        where: { id: In(ids) },
        relations: ['related'],
        select: ['id'],
      })

      if (activities.length) {
        for (const activity of activities) {
          activity.related.push(saved)
          await this.activityRepository.save(activity)
        }
      }
    }

    await this.keywordService.saveKeywords(activity.keywords, saved, 'activity')

    return saved
  }

  async deleteActivity(id: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne(id)
    await this.activityRepository.remove(activity)
    return activity
  }
}
