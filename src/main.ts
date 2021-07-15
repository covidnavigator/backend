import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

const process = require('process')

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.enableCors()
  await app.listen(process.env.PORT || 8080)
}
bootstrap()
