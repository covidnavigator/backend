import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrganizationController } from './organization.controller'
import { OrganizationService } from './organization.service'
import { Organization } from './organization.entity'
import { Contact } from '../contact/contact.entity'
import { Keyword } from '../keywords/keywords.entity'
import { KeywordsService } from '../keywords/keywords.service'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { ActivityOrganization } from '../activity/activity_organizrtion.entity'
import { ArticleCurator } from '../article/article_curator.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Contact,
      Keyword,
      KeywordsConsolidated,
      ActivityOrganization,
      ArticleCurator,
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, KeywordsService],
})
export class OrganizationModule {}
