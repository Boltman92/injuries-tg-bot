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
import { Message } from 'telegraf/types';
import { Player } from '../players/entity/Player';
import { FlagEmojiByLeagueId } from './constants';
import { MantraService } from '../mantra/mantra.service';

@Injectable()
export class BotService implements OnApplicationBootstrap, OnModuleDestroy {
  private bot: Telegraf<Context>;
  private readonly logger = new Logger(BotService.name);
  private messageHandler: (ctx: Context) => Promise<Message.TextMessage | void>;
  private myTeamHandler: (ctx: Context) => Promise<Message.TextMessage | void>;
  private deletePlayerHandler: (ctx: Context) => Promise<Message.TextMessage>;
  private maxMessageLength = 1024;
  constructor(
    private configService: ConfigService,
    private playersService: PlayersService,
    private userService: UsersService,
    private mantraService: MantraService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    if (!token) {
      console.log('TELEGRAM_BOT_TOKEN is not set');
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    this.bot = new Telegraf<Context>(token);
  }

  onApplicationBootstrap(): void {
    console.log('🤖 Initializing Telegram bot...');

    this.bot.start((ctx: Context) => {
      return ctx.reply(
        '👋 Hello! I am your fantasy injury predictor bot. For more commands, use /help \n',
      );
    });

    this.bot.command('help', (ctx: Context) => {
      return ctx.reply(
        'for start tracking injuries, just send me player name. \n For check your team, use /myTeam command',
      );
    });
    this.myTeamHandler = async (ctx: Context) => {
      const user = ctx.from;
      if (!user) {
        return ctx.reply('you are not logged in, please start the bot first');
      }
      const userEntity = await this.userService.findUserWithPlayers(
        user.id.toString(),
      );
      if (!userEntity) {
        return ctx.reply('you are not logged in, please start the bot first');
      }
      const playerList = userEntity.players.map(
        (player, index) =>
          `<b>${index + 1}. ${FlagEmojiByLeagueId[player.league?.id ?? 0] ?? ''} ${player.fullName}</b>`,
      );
      return this.sendMessageWithPlayers(ctx, 'your team is: \n', playerList);
    };
    this.bot.command('myTeam', this.myTeamHandler);

    this.deletePlayerHandler = async (ctx: Context) => {
      try {
        const text = ctx.text?.trim() ?? '';
        if (!text) {
          return ctx.reply('please provide player name');
        }
        const playerName = text.split(' ').slice(1).join(' ');

        if (!ctx.from?.id) {
          return ctx.reply('you are not logged in, please start the bot first');
        }

        await this.userService.deletePlayerForUser(
          ctx.from.id.toString(),
          playerName,
        );
        return ctx.reply(`player ${playerName} deleted`);
      } catch (error) {
        this.logger.error((error as Error).message);
        return ctx.reply(`${(error as Error).message}`);
      }
    };

    this.messageHandler = async (ctx: Context) => {
      try {
        const text = ctx.text as string;
        let playersNames: string[] = [];
        if (text.startsWith('delete')) {
          return this.deletePlayerHandler(ctx);
        }
        if (text.startsWith('https://mantrafootball.org/teams')) {
          const team = await this.mantraService.getMantraTeam(text);
          playersNames = team;
        } else if (text.startsWith('https://')) {
          return ctx.reply(
            'this url is not supported, please, send a valid url like: https://mantrafootball.org/teams/{your team id}',
          );
        } else {
          playersNames = text.split('\n');
        }
        const notFoundPlayers: string[] = [];
        const foundedPlayers: Player[] = [];
        for (const playerName of playersNames) {
          const player =
            await this.playersService.findPlayerInDBorFotmob(playerName);
          if (!player) {
            notFoundPlayers.push(playerName);
            continue;
          }
          this.logger.log(player);

          if (!ctx.from?.is_bot) {
            const name: string = ctx?.from?.username ?? '';
            const telegramId: string = ctx?.from?.id.toString() ?? '';

            const user = await this.userService.findOrCreateUser(
              name,
              telegramId,
            );

            const savedPlayer = await this.playersService.savePlayer(
              user,
              player,
            );
            if (savedPlayer) {
              foundedPlayers.push(savedPlayer);
            }
          }
        }

        if (foundedPlayers.length === 0) {
          return ctx.reply('no players found');
        }

        this.logger.log(foundedPlayers);

        const playerList = foundedPlayers.map(
          (player) =>
            `<b>${player.fullName}</b> from ${FlagEmojiByLeagueId[player.league?.id ?? 0] ?? ''} ${player.teamName}`,
        );
        return this.sendMessageWithPlayers(
          ctx,
          'thanks, i will start tracking injuries for: \n',
          playerList,
        );
      } catch (error) {
        this.logger.error((error as Error).message);
        return ctx.reply(`sorry, something went wrong, please try again later`);
      }
    };
    this.bot.on('message', this.messageHandler);

    // Don't await - bot.launch() is a long-running process that polls for updates
    // Awaiting it would block the application startup
    void this.bot.launch();

    console.log('🤖 Telegram bot is running...');
  }

  async sendMessageWithPlayers(
    ctx: Context,
    message: string,
    playersArray?: string[],
  ) {
    const playersChunks: string[][] = [];
    if (playersArray && playersArray?.length > 100) {
      for (let i = 0; i < playersArray?.length; i += 100) {
        playersChunks.push(playersArray?.slice(i, i + 100) ?? []);
      }
    }
    for (const chunk of playersChunks) {
      const msg = message + chunk.join('\n');
      await ctx.reply(msg, { parse_mode: 'HTML' });
    }
    if (playersChunks.length === 0) {
      const msg = message + (playersArray?.join('\n') ?? '');
      await ctx.reply(msg, { parse_mode: 'HTML' });
    }
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
    try {
      this.bot.stop();
    } catch (error) {
      this.logger.error('Error stopping Telegram bot:', error);
    }
  }
}
