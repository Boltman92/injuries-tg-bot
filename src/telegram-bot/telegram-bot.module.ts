import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotService } from './telegram-bot.service';
import { PlayersModule } from '../players/players.module';
import { UsersModule } from '../users/users.module';
import { MantraModule } from '../mantra/mantra.module';

@Module({
  imports: [ConfigModule, PlayersModule, UsersModule, MantraModule],
  providers: [BotService],
  exports: [BotService],
})
export class TelegramBotModule {}
