import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger=new Logger("Main")
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3004);
  logger.log(`Server running on port: 3004`)
}
bootstrap();
