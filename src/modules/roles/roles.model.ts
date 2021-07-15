import { IsOptional } from 'class-validator'
export class UpdateRolesDTO {
  @IsOptional()
  permissions: number[]
}
