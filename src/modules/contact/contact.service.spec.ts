import { Test, TestingModule } from '@nestjs/testing'
import { ContactService } from './contact.service'

describe('Contact Service', () => {
  let service: ContactService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService],
    }).compile()

    service = module.get<ContactService>(ContactService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
