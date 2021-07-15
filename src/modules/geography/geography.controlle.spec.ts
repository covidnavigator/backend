import { Test, TestingModule } from '@nestjs/testing'
import { GeographyController } from './geography.controller'

describe('Geography Controller', () => {
  let controller: GeographyController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeographyController],
    }).compile()

    controller = module.get<GeographyController>(GeographyController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
