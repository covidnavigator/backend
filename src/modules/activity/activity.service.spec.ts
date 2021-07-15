import { Test, TestingModule } from '@nestjs/testing'
import { ActivityService } from './activity.service'

describe('ArticleService', () => {
  let service: ActivityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityService],
    }).compile()

    service = module.get<ActivityService>(ActivityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
