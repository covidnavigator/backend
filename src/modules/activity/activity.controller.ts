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
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { User } from '../user/user.decorator'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { ActivityService } from './activity.service'
import {
  ActivityDTO,
  PaginatedActivitiesResultDto,
} from './activity.interfaces'
import { UserEntity } from '../user/user.entity'
import { GraphFilters } from '../dto/filters.dto'

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @UseGuards(JWTGuard)
  getActivities(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationSearchDto,
    @Query('status') status?: undefined | string
  ): Promise<PaginatedActivitiesResultDto> {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    if (paginationDto.page && paginationDto.limit) {
      return this.activityService.getPaginatedActivities(
        status,
        user,
        paginationDto
      )
    } else {
      throw new BadRequestException('page or limit is incorrect')
    }
  }

  @Get('/graph')
  getGraphActivities(
    @Query(ValidationPipe) filters: GraphFilters
  ): Promise<PaginatedActivitiesResultDto> {
    console.log('get graph data')
    return this.activityService.getGraphData(filters)
  }

  @Get('/profile')
  @UseGuards(JWTGuard)
  gettProfileActivities(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationSearchDto,
    @Query('status') status?: undefined | string
  ): Promise<PaginatedActivitiesResultDto> {
    console.log('get paginated profile activities')
    return this.activityService.getProfileActivities(
      user,
      paginationDto,
      status
    )
  }

  @Get('/count')
  @UseGuards(JWTGuard)
  getActivitiesCount(@User() user: UserEntity): Promise<number> {
    return this.activityService.getCount(user)
  }

  @Get(':id')
  getActivity(@Param('id', ParseIntPipe) id: number) {
    console.log('get activity', id)
    return this.activityService.getActivity(id)
  }

  @Post()
  @UseGuards(JWTGuard)
  createActivity(@Body() activity: ActivityDTO) {
    console.log('create activity', activity)
    return this.activityService.createActivity(activity)
  }

  @Patch(':id')
  @UseGuards(JWTGuard)
  updateActivity(
    @Param('id', ParseIntPipe) id: number,
    @Body() activity: ActivityDTO
  ) {
    console.log('update activity', id)
    return this.activityService.updateActivity(id, activity)
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  deleteArticle(@Param('id') id: number) {
    console.log('delete activity', id)
    return this.activityService.deleteActivity(id)
  }
}
