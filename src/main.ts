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

  // Graceful shutdown handler for database cleanup
  // Store handlers to prevent memory leaks from multiple registrations
  const shutdownHandler = () => {
    console.log('Shutdown signal received, closing database connection...');
    void (async () => {
      try {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }
        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    })();
  };

  // Register handlers only once to prevent accumulation
  process.once('SIGTERM', shutdownHandler);
  process.once('SIGINT', shutdownHandler);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`\n🚀 Application is running on: http://0.0.0.0:${port}\n`);
}
void bootstrap();
