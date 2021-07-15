import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Activity } from '../activity/activity.entity'
import { Article } from '../article/article.entity'
import { CreateListDTO, UpdateListDTO } from '../dto/ListDTO.dto'
import { UserEntity } from '../user/user.entity'

import { List } from './list.entity'

@Injectable()
export class ListService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>
  ) {}

  async createList(dto: CreateListDTO): Promise<List> {
    return await this.listRepository.save(dto)
  }

  async updateList(id: number, updateList: UpdateListDTO): Promise<List> {
    let articles = []
    let activities = []
    if (updateList.articles) {
      articles = updateList.articles.map(item => {
        let a = new Article()
        a.id = item
        return a
      })
    }
    if (updateList.activities) {
      activities = updateList.activities.map(item => {
        let a = new Activity()
        a.id = item
        return a
      })
    }

    const list = await this.listRepository.findOne(id)
    const updatedList = {
      ...list,
      articles,
      activities,
      name: updateList.name,
      description: updateList.description,
    }

    await this.listRepository.save(updatedList)

    return await this.listRepository.findOne(id, { select: ['name'] })
  }

  async getUserLists(user: UserEntity): Promise<List[]> {
    const response = await this.listRepository
      .createQueryBuilder('list')
      .select([
        'list.id',
        'list.name',
        'list.description',
        'articles.id',
        'articles.name',
        'activities.id',
        'activities.name',
        'creator.id',
      ])
      .leftJoin('list.articles', 'articles')
      .leftJoin('list.activities', 'activities')
      .leftJoin('list.creator', 'creator')
      .orderBy('list.id', 'ASC')
      .where(`creator.id = ${user.id}`)
      .getMany()

    return response
  }

  async deleteList(id: number): Promise<List> {
    const list = await this.listRepository.findOne(id, {
      select: ['name', 'id'],
    })
    await this.listRepository.remove(list)
    return list
  }
}
