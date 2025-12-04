import { Module, OnModuleDestroy } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { PlayersModule } from './players/players.module';
import { UsersModule } from './users/users.module';
import { FixturesModule } from './fixtures/fixtures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './data-source';
import { ScheduleModule } from '@nestjs/schedule';
import { LeaguesModule } from './leagues/leagues.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options),
    PuppeteerModule,
    TelegramBotModule,
    PlayersModule,
    UsersModule,
    FixturesModule,
    LeaguesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleDestroy {
  async onModuleDestroy() {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        console.log('Database connection closed');
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }
}
