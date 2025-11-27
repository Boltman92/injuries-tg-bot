import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayersService } from './players.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entity/Player';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';
import { LeaguesModule } from '../leagues/leagues.module';

@Module({
  imports: [
    ConfigModule,
    PuppeteerModule,
    LeaguesModule,
    TypeOrmModule.forFeature([Player]),
  ],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
