import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlayersService } from './players.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from './entity/Player';
import { PuppeteerModule } from '../puppeteer/puppeteer.module';
import { ImpitModule } from '../impit/impit.module';
import { LeaguesModule } from '../leagues/leagues.module';
import { Fixture } from '../fixtures/entity/Fixture';

@Module({
  imports: [
    ConfigModule,
    PuppeteerModule,
    ImpitModule,
    LeaguesModule,
    TypeOrmModule.forFeature([Player, Fixture]),
  ],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}
