import { UserInterface } from '../user/user.interface'

export class PaginatedUsersResultDto {
  data: UserInterface[]
  page: number
  limit: number
  sortName: string
  sortType: string
  totalCount: number
}
