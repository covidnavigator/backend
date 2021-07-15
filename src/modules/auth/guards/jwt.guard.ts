import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JWTGuard extends AuthGuard('jwt') {
  // handleRequest(err, user, info: Error) {
  //   console.log(err)
  //   console.log(user)
  //   console.log(info)
  //   if (err || info || !user) {
  //     throw err || info || new UnauthorizedException()
  //   }
  //   return user
  // }
}
