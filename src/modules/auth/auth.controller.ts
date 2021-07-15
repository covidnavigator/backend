import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  RegisterUserDTO,
  LoginDTO,
  RegisterDTO,
  ConfirmDTO,
} from '../user/user.model'
import { JWTGuard } from './guards/jwt.guard'

@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @UseGuards(JWTGuard)
  registerUser(@Body(ValidationPipe) credentials: RegisterUserDTO) {
    return this.authService.registerUser(credentials)
  }

  @Post('/login')
  login(@Body(ValidationPipe) credentials: LoginDTO) {
    console.log('login')
    return this.authService.login(credentials)
  }

  @Post('/register')
  register(@Body(ValidationPipe) credentials: RegisterDTO) {
    console.log('registration')
    return this.authService.register(credentials)
  }

  @Post('/confirm')
  confirm(@Body(ValidationPipe) data: ConfirmDTO) {
    console.log('confirmation')
    return this.authService.confirm(data)
  }

  @Post('/refreshtoken')
  public async refreshToken(@Body() body) {
    console.log('refreshToken')
    return await this.authService.refresh(body.refreshToken)
  }

  @Post('logout')
  @UseGuards(JWTGuard)
  async logOut(@Body() body) {
    console.log('logout')
    return await this.authService.logOutFromAllDevices(body.refreshtoken)
  }
}
