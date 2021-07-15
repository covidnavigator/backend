import { Test, TestingModule } from '@nestjs/testing'
import { GeographyService } from './geography.service'

describe('Geography Service', () => {
  let service: GeographyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeographyService],
    }).compile()

    service = module.get<GeographyService>(GeographyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
