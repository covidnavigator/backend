import { ArticleInterface } from '../article/article.interfaces'

export class PaginatedArticlesResultDto {
  data: ArticleInterface[]
  page: number
  limit: number
  sortName: string
  sortType: string
  totalCount: number
}
