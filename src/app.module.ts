import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ArticleModule } from './modules/article/article.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { RolesModule } from './modules/roles/roles.module'
import { PermissionsModule } from './modules/permissions/permissions.module'
import { ListModule } from './modules/list/list.module'
import { configService } from './config/config.service'

import { ContactModule } from './modules/contact/contact.module'
import { OrganizationModule } from './modules/organization/organization.module'
import { FeedbackModule } from './modules/feedback/feedback.module'
import { ActivityModule } from './modules/activity/activity.module'
import { KeywordsModule } from './modules/keywords/keywords.module'
import { GeographyModule } from './modules/geography/geography.module'
import { MailModule } from './modules/mail/mail.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ArticleModule,
    ActivityModule,
    UserModule,
    AuthModule,
    RolesModule,
    ListModule,
    PermissionsModule,
    ContactModule,
    OrganizationModule,
    FeedbackModule,
    KeywordsModule,
    GeographyModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
