import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Article } from '../article/article.entity'
import { Country } from './entities/countries.entity'
import { Locality } from './entities/localities.entity'
import { PanCountry } from './entities/pancountries.entity'
import { Region } from './entities/regions.entity'
import { State } from './entities/state.entity'

import { GeographyController } from './geography.controller'
import { GeographyService } from './geography.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Country,
      PanCountry,
      State,
      Region,
      Locality,
      Article,
    ]),
  ],
  controllers: [GeographyController],
  providers: [GeographyService],
})
export class GeographyModule {}
