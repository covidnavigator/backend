import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common'
import { ListService } from './list.service'

import { UserEntity } from '../user/user.entity'
import { CreateListDTO, UpdateListDTO } from '../dto/ListDTO.dto'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { User } from '../user/user.decorator'

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('/profile')
  @UseGuards(JWTGuard)
  getUserLists(@User() user: UserEntity) {
    console.log('get all lists of ' + user.username)
    return this.listService.getUserLists(user)
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  updateList(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateListDTO
  ) {
    console.log('update list', id)
    return this.listService.updateList(id, data)
  }

  @Post()
  @UseGuards(JWTGuard)
  createList(@Body() data: CreateListDTO) {
    console.log('create list ', data.name)
    return this.listService.createList(data)
  }

  @Delete(':id')
  @UseGuards(JWTGuard)
  deleteList(@Param('id') id: number) {
    console.log('delete list', id)
    return this.listService.deleteList(id)
  }
}
