import { Feedback } from '../feedback/feedback.entity'

export class PaginatedFeedbacksResultDto {
  data: Feedback[]
  page: number
  limit: number
  sortName: string
  sortType: string
  totalCount: number
  allCount: number
}
