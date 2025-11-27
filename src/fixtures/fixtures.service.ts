import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Fixture } from './entity/Fixture';
import { Between, Repository } from 'typeorm';
import { PlayersService } from '../players/players.service';
import { BotService } from '../telegram-bot/telegram-bot.service';

const FIXTURES_TIME_INTERVAL = 24 * 60 * 60 * 1000;

@Injectable()
export class FixturesService {
  private readonly logger = new Logger(FixturesService.name);
  constructor(
    @InjectRepository(Fixture)
    private readonly fixtureRepository: Repository<Fixture>,
    private readonly playersService: PlayersService,
    private readonly botService: BotService,
  ) {}

  async setFixtureAsNotified(fixtureId: number) {
    return this.fixtureRepository.update(fixtureId, {
      isNotified: true,
    });
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async getFixtures() {
    const now = new Date();
    const intervalFromNow = new Date(now.getTime() + FIXTURES_TIME_INTERVAL);
    // TODO: add check if fixtures are already notified
    const fixtures = await this.fixtureRepository.find({
      where: { fixtureDate: Between(now, intervalFromNow) },
      relations: ['league'],
    });
    if (fixtures.length > 0) {
      for (const fixture of fixtures) {
        const isNotified =
          await this.botService.notifyAllUsersByLeagueId(fixture);
        if (isNotified) {
          await this.setFixtureAsNotified(fixture.id);
        }
      }
      this.logger.log('check injuries is finished');
    } else {
      this.logger.warn('No fixtures found');
    }
  }
}
