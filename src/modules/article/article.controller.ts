import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { ArticleService } from './article.service'

import { UserEntity } from '../user/user.entity'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { PaginatedArticlesResultDto } from '../dto/article.paginatedResults.dto'
import { AssetDTO } from '../dto/asset.dto'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { User } from '../user/user.decorator'

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(JWTGuard)
  getArticles(
    @Query() paginationDto: PaginationSearchDto,
    @User() user: UserEntity,
    @Query('status') status?: undefined | string
  ): Promise<PaginatedArticlesResultDto> {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    if (paginationDto.page && paginationDto.limit) {
      console.log('get paginated ' + status + ' articles')
      return this.articleService.getPaginatedArticles(
        status,
        user,
        paginationDto
      )
    } else {
      throw new BadRequestException('page or limit is incorrect')
    }
  }

  @Get('/count')
  @UseGuards(JWTGuard)
  getActivitiesCount(@User() user: UserEntity): Promise<number> {
    return this.articleService.getCount(user)
  }

  @Get('/profile')
  @UseGuards(JWTGuard)
  getArticlesByIds(
    @Query() paginationDto: PaginationSearchDto,
    @User() user: UserEntity,
    @Query('status') status?: undefined | string
  ): Promise<PaginatedArticlesResultDto> {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    console.log('get profile articles')
    return this.articleService.getPaginatedArticlesByIds(
      user,
      paginationDto,
      status
    )
  }

  @Get(':id')
  getArticle(@Param('id', ParseIntPipe) id: number) {
    console.log('get article', id)
    return this.articleService.getArticle(id)
  }

  @Post()
  @UseGuards(JWTGuard)
  createArticle(@Body() article: AssetDTO) {
    console.log('create article', article)
    return this.articleService.createArticle(article)
  }

  @Patch(':id')
  @UseGuards(JWTGuard)
  updateArticle(
    @Param('id', ParseIntPipe) id: number,
    @Body() article: AssetDTO
  ) {
    console.log('update article', id)
    return this.articleService.updateArticle(id, article)
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  deleteArticle(@Param('id') id: number) {
    console.log('delete article', id)
    return this.articleService.deleteArticle(id)
  }
}
