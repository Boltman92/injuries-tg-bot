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

  async findUserWithPlayers(telegramId: string) {
    return this.userRepository.findOne({
      where: { telegramId },
      order: { players: { league: { id: 'ASC' } } },
      relations: ['players', 'players.league'],
    });
  }

  async findOrCreateUser(name: string, telegramId: string) {
    const user = await this.findUser(telegramId);
    if (user) {
      return user;
    }
    return this.createUser(name, telegramId);
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

  async deletePlayerForUser(userId: string, playerName: string) {
    console.log(`Deleting player ${playerName} for user ${userId}`);
    const userEntity = await this.userRepository.findOne({
      where: {
        telegramId: userId,
      },
      relations: ['players'],
    });

    if (!userEntity) {
      throw new Error('User not found');
    }

    const updatedPlayers = userEntity.players.filter(
      (player) =>
        player.fullName.toLowerCase() !== playerName.toLowerCase().trim(),
    );
    if (updatedPlayers.length === userEntity.players.length) {
      throw new Error(`Player ${playerName} not found in your team`);
    }
    const updateUser = {
      ...userEntity,
      players: updatedPlayers,
    };
    return this.userRepository.save(updateUser);
  }
}
