import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Player } from '../../players/entity/Player';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  telegramId: string;
  @Column()
  name: string;

  @ManyToMany(() => Player, (player) => player.users, { cascade: true })
  @JoinTable()
  players: Player[];
}
