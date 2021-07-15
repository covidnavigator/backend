import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FeedbackController } from './feedback.controller'
import { FeedbackService } from './feedback.service'
import { Feedback } from './feedback.entity'
import { Contact } from '../contact/contact.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Feedback])],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
