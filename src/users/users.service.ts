import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/User';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(name: string, telegramId: string) {
    const user = this.userRepository.create({ name, telegramId });
    return this.userRepository.save(user);
  }

  async findUser(telegramId: string) {
    return this.userRepository.findOne({ where: { telegramId } });
  }

  // TODO: add pagination support
  async findAllUsersWithPlayersByLeagueId(leagueId: number) {
    return this.userRepository.find({
      where: {
        players: {
          league: {
            id: leagueId,
          },
          injuryStatus: Not(''),
        },
      },
      relations: ['players'],
      take: 500,
    });
  }
}
