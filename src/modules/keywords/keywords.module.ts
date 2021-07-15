import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Keyword } from '../keywords/keywords.entity'
import { KeywordsController } from './keywords.controller'
import { KeywordsService } from './keywords.service'
import { KeywordsConsolidated } from './keywordsConsolidated.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Keyword, KeywordsConsolidated])],
  controllers: [KeywordsController],
  providers: [KeywordsService],
})
export class KeywordsModule {}
