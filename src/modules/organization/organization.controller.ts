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
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { OrganizationService } from './organization.service'
import { Organization } from './organization.entity'
import { PaginationSearchDto } from '../dto/pagination.dto'
import { JWTGuard } from '../auth/guards/jwt.guard'
import { OrganizationDTO } from './organization.interface'

@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('organization')
  getOrganizations(@Query() paginationDto: PaginationSearchDto) {
    paginationDto.page = Number(paginationDto.page)
    paginationDto.limit = Number(paginationDto.limit)
    if (paginationDto.page && paginationDto.limit) {
      console.log('get paginated organizations')
      return this.organizationService.getPaginatedOrganizations(paginationDto)
    } else {
      console.log('get all organizations')
      return this.organizationService.getOrganizations()
    }
  }

  @Get('organization/:id')
  getOrganization(@Param('id', ParseIntPipe) id: number) {
    console.log('get ' + id + ' organization')
    return this.organizationService.getOrganization(id)
  }

  @Post('organization')
  @UseGuards(JWTGuard)
  createOrganization(@Body() organization: OrganizationDTO) {
    console.log('create ' + organization.data.name + ' organization')
    return this.organizationService.createOrganization(organization)
  }

  @Patch('organization/:id')
  @UseGuards(JWTGuard)
  updateOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Body() organization: OrganizationDTO
  ) {
    console.log('update ' + id + ' organization')
    return this.organizationService.updateOrganization(id, organization)
  }

  @Delete('organization/:id')
  @UseGuards(JWTGuard)
  deleteOrganization(@Param('id') id: number) {
    console.log('delete' + id + ' organization')
    return this.organizationService.deleteOrganization(id)
  }
}
