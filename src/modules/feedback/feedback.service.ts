import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Not, Equal, Brackets } from 'typeorm'

import { Dates, PaginationSearchDto } from '../dto/pagination.dto'
import { PaginatedFeedbacksResultDto } from '../dto/feedback.paginatedResults.dto'

import { Feedback } from './feedback.entity'
const fs = require('fs')

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>
  ) {}

  async getFeedbacks(
    status: string,
    paginationDto: PaginationSearchDto,
    dates: Dates
  ): Promise<PaginatedFeedbacksResultDto> {
    const skippedItems = (paginationDto.page - 1) * paginationDto.limit
    const start = dates.startDate ? new Date(dates.startDate) : null
    const end = dates.endDate ? new Date(dates.endDate) : null

    const allCount = await this.feedbackRepository.find()

    const feedbacksWithoutLimits = await this.feedbackRepository.createQueryBuilder(
      'feedback'
    )
    const feedbacks = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .offset(skippedItems)
      .limit(paginationDto.limit)
      .orderBy(
        paginationDto.sortName,
        paginationDto.sortType === 'up' ? 'ASC' : 'DESC'
      )

    if (status !== 'All') {
      feedbacksWithoutLimits.where({ status: status })
      feedbacks.where({ status: status })
    } else {
      feedbacksWithoutLimits.where({ status: Not(Equal('Hidden')) })
      feedbacks.where({ status: Not(Equal('Hidden')) })
    }
    if (dates.startDate && dates.endDate) {
      feedbacksWithoutLimits.andWhere('feedback.created > :start', {
        start: start.toISOString(),
      })
      feedbacks.andWhere('feedback.created > :start', {
        start: start.toISOString(),
      })
      feedbacksWithoutLimits.andWhere('feedback.created < :end', {
        end: end.toISOString(),
      })
      feedbacks.andWhere('feedback.created < :end', {
        end: end.toISOString(),
      })
    }
    if (paginationDto.searchString && paginationDto.searchBy) {
      const parameters = { searchString: `%${paginationDto.searchString}%` }
      let where = ''
      if (paginationDto.searchBy === 'title') {
        where =
          'LOWER(feedback.title) like LOWER(:searchString) OR LOWER(feedback.message) like LOWER(:searchString)'
      } else if (paginationDto.searchBy === 'name') {
        where =
          'LOWER(feedback.username) like LOWER(:searchString) OR LOWER(feedback.userEmail) like LOWER(:searchString)'
      }
      if (where) {
        feedbacksWithoutLimits.andWhere(
          new Brackets(qb => {
            qb.where(where, parameters)
          })
        )
        feedbacks.andWhere(
          new Brackets(qb => {
            qb.where(where, parameters)
          })
        )
      }
    }

    const outputWithoutLimits = await feedbacksWithoutLimits.getMany()
    const output = await feedbacks.getMany()

    return {
      totalCount: outputWithoutLimits.length,
      allCount: allCount.length,
      sortName: paginationDto.sortName,
      sortType: paginationDto.sortType,
      page: Number(paginationDto.page),
      limit: Number(paginationDto.limit),
      data: output,
    }
  }

  async createFeedback(feedback: Feedback): Promise<Feedback> {
    const date = new Date()
    feedback.created = date
    return await this.feedbackRepository.save(feedback)
  }

  async getFeedback(id: number): Promise<Feedback> {
    return await this.feedbackRepository.findOne(id)
  }

  async updateFeedback(id: number, feedback: Feedback): Promise<Feedback> {
    await this.feedbackRepository.update({ id }, feedback)
    return this.feedbackRepository.findOne(id)
  }

  async deleteFeedback(id: number): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne(id)
    return await this.feedbackRepository.remove(feedback)
  }

  async getFile(): Promise<Buffer> {
    const filepath =
      __dirname +
      '/../../../public/COVID_Navigator_Test_Scipt_Survey_050621.pdf'

    const pdf = await new Promise<Buffer>((resolve, reject) => {
      fs.readFile(filepath, {}, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    return pdf
  }
}
