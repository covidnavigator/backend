import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common'
import { RolesService } from './roles.service'
import { UpdateRolesDTO } from './roles.model'
import { AuthGuard } from '@nestjs/passport'
import { JWTGuard } from '../auth/guards/jwt.guard'
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @UseGuards(JWTGuard)
  getRoles() {
    console.log('get roles')
    return this.rolesService.getRoles()
  }

  @Get(':id')
  @UseGuards(JWTGuard)
  getRole(@Param('id', ParseIntPipe) id: number) {
    console.log('get ' + id + ' role')
    return this.rolesService.getRole(id)
  }

  @Put(':id')
  @UseGuards(JWTGuard)
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateRolesDTO
  ) {
    console.log('update role', id)
    return this.rolesService.updateRole(id, data)
  }
}
