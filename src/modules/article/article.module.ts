import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArticleController } from './article.controller'
import { ArticleService } from './article.service'
import { Article } from './article.entity'
import { Organization } from '../organization/organization.entity'
import { ArticleCurator } from './article_curator.entity'
import { UserEntity } from '../user/user.entity'
import { Keyword } from '../keywords/keywords.entity'
import { KeywordsService } from '../keywords/keywords.service'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { OrganizationService } from '../organization/organization.service'
import { Contact } from '../contact/contact.entity'
import { ActivityOrganization } from '../activity/activity_organizrtion.entity'
import { GeographyService } from '../geography/geography.service'
import { Country } from '../geography/entities/countries.entity'
import { PanCountry } from '../geography/entities/pancountries.entity'
import { State } from '../geography/entities/state.entity'
import { Locality } from '../geography/entities/localities.entity'
import { Region } from '../geography/entities/regions.entity'
import { PermissionsService } from '../permissions/permissions.service'
import { ArticleJournal } from './article_journal.entity';
import { ArticleExternalSources } from './article_external_sources.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      UserEntity,
      Organization,
      ArticleCurator,
      Keyword,
      KeywordsConsolidated,
      Contact,
      ActivityOrganization,
      Country,
      PanCountry,
      State,
      Locality,
      Region,
      ArticleJournal,
      ArticleExternalSources,
    ]),
  ],
  controllers: [ArticleController],
  providers: [
    ArticleService,
    PermissionsService,
    KeywordsService,
    GeographyService,
    OrganizationService,
  ],
})
export class ArticleModule {}
