import {
  Controller,
  Get,
  Delete,
  Patch,
  Put,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { JWTGuard } from '../auth/guards/jwt.guard'

import { User } from './user.decorator'
import { UserEntity } from './user.entity'
import { UpdatePasswordDTO, UpdateUserDTO } from './user.model'
import { PaginationSearchDto } from '../dto/pagination.dto'

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @UseGuards(JWTGuard)
  getUsers(@Query() paginationDto: PaginationSearchDto) {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    if (paginationDto.page && paginationDto.limit) {
      console.log('get paginated users')
      return this.userService.getPaginatedUsers(paginationDto)
    } else {
      console.log('get all users')
      return this.userService.getUsers()
    }
  }

  @Get('usersCount')
  @UseGuards(JWTGuard)
  getUsersCount() {
    return this.userService.getUsersCount()
  }

  @Get('user/:id')
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id)
  }

  @Get('user')
  @UseGuards(JWTGuard)
  findCurrentUser(@User() { username }: UserEntity) {
    console.log('find user by username')
    return this.userService.findByUsername(username)
  }

  @Get('profileInfo')
  @UseGuards(JWTGuard)
  getProfileInfo(@User() { username }: UserEntity) {
    console.log('get profile info')
    return this.userService.getProfileInfo(username)
  }

  @Patch('user/:id')
  @UseGuards(JWTGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO
  ) {
    console.log('update user', id)
    return this.userService.updateUser(id, data)
  }

  @Put('user/password')
  @UseGuards(JWTGuard)
  updatePassword(
    @User() user: UserEntity,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdatePasswordDTO
  ) {
    console.log('update profile password')
    return this.userService.updateUserPassword(user, data)
  }

  @Delete('user/:id')
  @UseGuards(JWTGuard)
  deleteUser(@Param('id') id: number) {
    console.log('delete user', id)
    return this.userService.deleteUser(id)
  }
}
