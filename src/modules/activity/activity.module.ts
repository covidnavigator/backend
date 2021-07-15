import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UserEntity } from '../user/user.entity'
import { ActivityService } from './activity.service'
import { ActivityController } from './activity.controller'
import { Activity } from './activity.entity'
import { ActivityOrganization } from './activity_organizrtion.entity'
import { Organization } from '../organization/organization.entity'
import { Article } from '../article/article.entity'
import { Keyword } from '../keywords/keywords.entity'
import { KeywordsConsolidated } from '../keywords/keywordsConsolidated.entity'
import { KeywordsService } from '../keywords/keywords.service'
import { OrganizationService } from '../organization/organization.service'
import { Contact } from '../contact/contact.entity'
import { ArticleCurator } from '../article/article_curator.entity'
import { PermissionsService } from '../permissions/permissions.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Activity,
      Article,
      UserEntity,
      Organization,
      ActivityOrganization,
      ArticleCurator,
      Keyword,
      KeywordsConsolidated,
      Contact,
    ]),
  ],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    KeywordsService,
    PermissionsService,
    OrganizationService,
  ],
})
export class ActivityModule {}
