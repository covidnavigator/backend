import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmptyObject,
  IsNumber,
} from 'class-validator'
import { Roles } from '../roles/roles.entity'

export class LoginDTO {
  @IsString()
  email: string

  @IsString()
  password: string
}

export class RegisterUserDTO extends LoginDTO {
  @IsString()
  username: string

  @IsOptional()
  organization: string

  @IsNotEmptyObject()
  role: Roles
}

export class RegisterDTO extends LoginDTO {
  @IsString()
  username: string

  @IsString()
  organization: string
}

export class ConfirmDTO {
  @IsNumber()
  userId: number

  @IsString()
  code: string
}

export class UpdateUserDTO {
  @IsOptional()
  email: string

  @IsOptional()
  username: string

  @IsOptional()
  organization: string

  @IsOptional()
  role: Roles

  @IsOptional()
  password: string

  @IsOptional()
  active: boolean
}

export class UpdatePasswordDTO {
  @IsString()
  currentPassword: string

  @IsString()
  newPassword: string
}

export interface AuthPayload {
  sub: string
}
