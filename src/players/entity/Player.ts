import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entity/User';
import { League } from '../../leagues/entity/League';

@Entity()
export class Player {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fotmobId: string;
  @Column()
  fullName: string;
  @Column()
  teamName: string;
  @Column()
  teamId: string;
  @Column({ nullable: true })
  injuryStatus?: string;
  @Column({ nullable: true })
  expectedReturn?: string;

  @ManyToOne(() => League, (league: League) => league.players)
  league: League;

  @ManyToMany(() => User, (user: User) => user.players)
  users: User[];
}
