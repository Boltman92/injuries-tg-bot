/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlayersService } from '../players/players.service';
import { UsersService } from '../users/users.service';
import { Telegraf } from 'telegraf';
import type { Context } from 'telegraf';
import { Fixture } from '../fixtures/entity/Fixture';

@Injectable()
export class BotService implements OnApplicationBootstrap, OnModuleDestroy {
  private bot: Telegraf<Context>;
  private readonly logger = new Logger(BotService.name);
  constructor(
    private configService: ConfigService,
    private playersService: PlayersService,
    private userService: UsersService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    if (!token) {
      console.log('TELEGRAM_BOT_TOKEN is not set');
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.bot = new Telegraf<Context>(token);
  }

  async onApplicationBootstrap(): Promise<void> {
    console.log('🤖 Initializing Telegram bot...');

    this.bot.start((ctx: Context) => {
      return ctx.reply(
        '👋 Hello! I am your fantasy injury predictor bot. For more commands, use /help \n',
      );
    });

    this.bot.command('help', (ctx: Context) => {
      return ctx.reply('for start tracking injuries, just send me player name');
    });

    this.bot.on('message', async (ctx: any) => {
      const player = await this.playersService.findPlayer(
        ctx?.message?.text as string,
      );
      if (!player) {
        return ctx.reply(`player not found`);
      }

      if (!ctx.update?.message?.from?.is_bot) {
        // TODO: check if user already exists and save only after
        //save user
        const name: string = ctx?.update?.message?.from?.username as string;
        const telegramId: string =
          ctx?.update?.message?.from?.id.toString() as string;

        const user = await this.userService.findUser(telegramId);

        const userEntity =
          user || (await this.userService.createUser(name, telegramId));

        await this.playersService.savePlayer(userEntity, player);
      }

      return ctx.reply(
        `thanks, i will start tracking injuries for ${player?.name} from ${player?.primaryTeam.teamName}`,
      );
    });

    await this.bot.launch();

    console.log('🤖 Telegram bot is running...');
  }

  async notifyAllUsersByLeagueId(fixture: Fixture) {
    try {
      const usersWithPlayersByLeagueId =
        await this.userService.findAllUsersWithPlayersByLeagueId(
          fixture.league.id,
        );
      this.logger.log(
        `Notifying all users by league id: ${fixture.league.id}, users: ${usersWithPlayersByLeagueId.length}`,
      );
      for (const user of usersWithPlayersByLeagueId) {
        const playerList = user.players
          .map(
            (player) =>
              `<b>${player.fullName}</b> - ${player.injuryStatus} - ${player.expectedReturn}`,
          )
          .join('\n');
        await this.bot.telegram.sendMessage(
          user.telegramId,
          `🟥 Players of ${fixture.league.name} are injured: \n${playerList}`,
          { parse_mode: 'HTML' },
        );
      }
    } catch (error) {
      this.logger.error(
        `Error notifying users by league id: ${fixture.league.id}`,
        error,
      );
      return false;
    }
    return true;
  }

  onModuleDestroy(): void {
    console.log('🤖 Telegram bot is stopping...');
    this.bot.stop();
  }
}
