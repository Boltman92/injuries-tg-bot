/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Player } from './entity/Player';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Like, Repository } from 'typeorm';
import { PlayerResponse, SuggestionResponse } from './players.interfaces';
import { User } from '../users/entity/User';
import { PuppeteerService } from '../puppeteer/puppeteer.service';
import { Logger } from '@nestjs/common';
import { LeaguesService } from '../leagues/leagues.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Fixture } from '../fixtures/entity/Fixture';

const FIXTURES_TIME_INTERVAL = 12 * 60 * 60 * 1000;
@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);
  constructor(
    private puppeteerService: PuppeteerService,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly leaguesService: LeaguesService,
    @InjectRepository(Fixture)
    private readonly fixtureRepository: Repository<Fixture>,
  ) {}

  private readonly BATCH_SIZE = 100;

  public async findPlayer(name: string): Promise<PlayerResponse | null> {
    try {
      const url = this.getSearchPlayerUrl(name);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://www.fotmob.com/',
        },
      });

      if (!response.ok) {
        this.logger.error(
          `Failed to fetch suggestions data: ${response.statusText}`,
        );
        return null;
      }
      const data: {
        title: { key: string };
        suggestions: SuggestionResponse[];
      }[] = await response.json();

      const players = data.find(
        (suggestion) => suggestion.title.key === 'players',
      );

      if (!players?.suggestions || players?.suggestions.length === 0) {
        return null;
      }

      const fotmobPlayerName = players?.suggestions?.[0]?.name;

      this.logger.log(fotmobPlayerName);

      if (fotmobPlayerName.toLowerCase().includes(name.toLowerCase())) {
        const player = players?.suggestions?.[0];

        const playerUrl = this.getPlayerInfoUrl(player.id);

        this.logger.log(
          this.puppeteerService.xMasToken,
          'xmas token inside player service',
        );

        const playerInfoResponse = await fetch(playerUrl, {
          headers: {
            'x-mas': this.puppeteerService.xMasToken ?? '',
            'User-Agent': 'Mozilla/5.0',
            Accept: 'application/json, text/plain, */*',
            Referer: 'https://www.fotmob.com/',
          },
        });

        if (!playerInfoResponse.ok) {
          this.logger.error(
            `Failed to fetch player info data: ${playerInfoResponse.statusText}`,
          );
          return null;
        }

        const playerInfo: PlayerResponse = await playerInfoResponse.json();

        //this.logger.log(playerInfo);

        const url = this.getPlayerInfoUrl(player.id);

        this.logger.log(url);

        return playerInfo;
      }

      return null;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  public async findPlayerInDBorFotmob(
    name: string,
  ): Promise<PlayerResponse | Player | null> {
    const playersFromDB = await this.findPlayerInDBByName(name);
    if (playersFromDB.length === 1) {
      return playersFromDB[0];
    }
    const player = await this.findPlayer(name);
    if (player) {
      return player;
    }
    return null;
  }

  private getSearchPlayerUrl(name: string): string {
    return `https://www.fotmob.com/api/data/search/suggest?hits=50&lang=en&term=${name}`;
  }

  private getPlayerInfoUrl(id: string): string {
    return `https://www.fotmob.com/api/data/playerData?id=${id}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async savePlayer(user: User, playerInfo: PlayerResponse | Player) {
    if (playerInfo instanceof Player) {
      const userAlreadyExists = playerInfo.users.find(
        (u) => u.telegramId === user.telegramId,
      );
      if (userAlreadyExists) {
        return;
      }
      playerInfo.users.push(user);
      return this.playerRepository.save(playerInfo);
    }
    const {
      id: fotmobId,
      name: fullName,
      mainLeague,
      injuryInformation,
    } = playerInfo;
    const { teamName, teamId } = playerInfo.primaryTeam;
    //const { leagueId, leagueName } = playerInfo.mainLeague;
    const existedPlayer = await this.findPlayerInDB(fotmobId.toString());
    if (existedPlayer) {
      const userAlreadyExists = existedPlayer.users.find(
        (u) => u.telegramId === user.telegramId,
      );
      if (userAlreadyExists) {
        return;
      } else {
        existedPlayer.users.push(user);
        return this.playerRepository.save(existedPlayer);
      }
    }

    this.logger.log(user, 'user');

    const league = await this.leaguesService.findLeagueInDB(
      mainLeague.leagueId,
    );

    if (!league) {
      return null;
    }

    return this.playerRepository.save({
      fotmobId: fotmobId.toString(),
      fullName,
      teamName,
      teamId: teamId.toString(),
      users: [user],
      league,
      injuryStatus: injuryInformation?.name ?? '',
      expectedReturn:
        injuryInformation?.expectedReturn?.expectedReturnFallback ?? '',
    });
  }

  async findPlayerInDBByName(name: string) {
    const capitalizedName =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return this.playerRepository.find({
      where: { fullName: Like(`%${capitalizedName}%`) },
      relations: ['users'],
    });
  }

  async findPlayerInDB(fotmobId: string) {
    return this.playerRepository.findOne({
      where: { fotmobId },
      relations: ['users'],
    });
  }

  async checkPlayerInjuries(player: Player): Promise<{
    injury: string;
    expectedReturn: string;
  } | null> {
    const playerUrl = this.getPlayerInfoUrl(player.fotmobId);
    const playerInfoResponse = await fetch(playerUrl, {
      headers: { 'x-mas': this.puppeteerService.xMasToken ?? '' },
    });
    const playerInfo: PlayerResponse = await playerInfoResponse.json();
    if (playerInfo.injuryInformation) {
      return {
        injury: playerInfo.injuryInformation.name
          ? playerInfo.injuryInformation.name
          : 'Unknown injury',
        expectedReturn:
          playerInfo.injuryInformation.expectedReturn?.expectedReturnFallback ??
          'Unknown',
      };
    }
    return null;
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async updatePlayersInjuries(skip: number = 0) {
    const now = new Date();
    const intervalFromNow = new Date(now.getTime() + FIXTURES_TIME_INTERVAL);
    const fixtures = await this.fixtureRepository.find({
      where: { fixtureDate: Between(now, intervalFromNow), isNotified: false },
    });
    if (fixtures.length === 0) {
      this.logger.log('no fixtures to update injuries for');
      return;
    }

    const players = await this.playerRepository.find({
      take: this.BATCH_SIZE,
      skip,
    });

    if (players.length === 0) {
      this.logger.log('finished updating injuries');
      return;
    }

    this.logger.log(
      `starting to update injuries for ${players.length} players (skip: ${skip})`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const player of players) {
      try {
        const injury = await this.checkPlayerInjuries(player);

        if (injury) {
          this.logger.log(`${player.fullName} has ${injury.injury}`);
        }

        await this.playerRepository.update(player.id, {
          injuryStatus: injury?.injury ?? '',
          expectedReturn: injury?.expectedReturn ?? '',
        });

        successCount++;
      } catch (error) {
        errorCount++;
        this.logger.error(
          `Error updating injury for player ${player.fullName} (ID: ${player.id}):`,
          error,
        );
      }
      await this.sleep(1000 * 10);
    }

    this.logger.log(
      `Batch complete: ${successCount} succeeded, ${errorCount} failed`,
    );

    if (players.length === this.BATCH_SIZE) {
      await this.updatePlayersInjuries(skip + this.BATCH_SIZE);
    } else {
      this.logger.log('finished updating injuries');
    }
  }
}
