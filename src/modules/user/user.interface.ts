export interface UserInterface {
  id: number
  active: boolean
  organization: string
  createdAt: Date
  updatedAt: Date
  email: string
  username: string
  role: string
  articlesCount: number
  activitiesCount: number
}
