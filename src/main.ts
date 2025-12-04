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

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 Application is running on: http://0.0.0.0:${port}\n`);
}
void bootstrap();
