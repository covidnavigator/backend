import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Request = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest()
  }
)
