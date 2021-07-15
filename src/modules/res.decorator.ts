import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Response = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getResponse()
  }
)
