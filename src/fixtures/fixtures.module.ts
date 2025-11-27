import { Module } from '@nestjs/common';
import { FixturesService } from './fixtures.service';
import { Fixture } from './entity/Fixture';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayersModule } from '../players/players.module';
import { TelegramBotModule } from '../telegram-bot/telegram-bot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fixture]),
    PlayersModule,
    TelegramBotModule,
  ],
  providers: [FixturesService],
  exports: [FixturesService],
})
export class FixturesModule {}
