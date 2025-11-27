import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { League } from './entity/League';
import { Repository } from 'typeorm';

@Injectable()
export class LeaguesService {
  constructor(
    @InjectRepository(League)
    private readonly leagueRepository: Repository<League>,
  ) {}
  async findLeagueInDB(fotmobId: number) {
    return this.leagueRepository.findOne({
      where: { fotmobId },
    });
  }
}
