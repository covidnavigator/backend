import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ListController } from './list.controller'
import { ListService } from './list.service'
import { List } from './list.entity'
import { Article } from '../article/article.entity'

@Module({
  imports: [TypeOrmModule.forFeature([List, Article])],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
