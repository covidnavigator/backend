import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { Feedback } from './feedback.entity'
import { Dates, PaginationSearchDto } from '../dto/pagination.dto'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { Response } from 'express'
import { Readable } from 'stream'

@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('feedbacks')
  @UseGuards(JWTGuard)
  getFeedbacks(
    @Query() paginationDto: PaginationSearchDto,
    @Query('status') status: string,
    @Body() dates: Dates
  ) {
    console.log('get feedbacks')
    return this.feedbackService.getFeedbacks(status, paginationDto, dates)
  }

  @Get('feedback/:id')
  @UseGuards(JWTGuard)
  getFeedback(@Param('id', ParseIntPipe) id: number) {
    console.log('get ' + id + ' feedback')
    return this.feedbackService.getFeedback(id)
  }

  @Post('feedback')
  createFeedback(@Body() feedback: Feedback) {
    console.log('create ' + feedback.title + ' feedback')
    return this.feedbackService.createFeedback(feedback)
  }

  @Patch('feedback/:id')
  @UseGuards(JWTGuard)
  updateFeedback(
    @Param('id', ParseIntPipe) id: number,
    @Body() feedback: Feedback
  ) {
    console.log('update ' + id + ' feedback')
    return this.feedbackService.updateFeedback(id, feedback)
  }

  @Delete('feedback/:id')
  @UseGuards(JWTGuard)
  deleteFeedback(@Param('id') id: number) {
    console.log('delete' + id + ' feedback')
    return this.feedbackService.deleteFeedback(id)
  }

  @Get('info/feedback')
  async downloadFeedback(@Res() res: Response) {
    const pdf = await this.feedbackService.getFile()

    const stream = new Readable()
    stream.push(pdf)
    stream.push(null)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
    })

    stream.pipe(res)
  }
}
