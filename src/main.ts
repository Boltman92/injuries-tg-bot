import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  await app.listen(3001);
  console.log('LISTENING ON PORT 3001');
}
void bootstrap();
