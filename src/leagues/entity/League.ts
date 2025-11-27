import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Fixture } from '../../fixtures/entity/Fixture';
import { Player } from '../../players/entity/Player';

@Entity()
export class League {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fotmobId: number;
  @Column()
  name: string;

  @OneToMany(() => Fixture, (fixture: Fixture) => fixture.league)
  fixtures: Fixture[];

  @OneToMany(() => Player, (player: Player) => player.league)
  players: Player[];
}
