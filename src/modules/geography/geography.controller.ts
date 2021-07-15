import { Controller, Get } from '@nestjs/common'
import { GeographyService } from './geography.service'

@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get()
  getGeography() {
    console.log('get geography')
    return this.geographyService.getGeography()
  }
}
