import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { League } from '../../leagues/entity/League';

@Entity()
export class Fixture {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  fixtureId: number;
  @Column()
  seasonId: number;
  @Column()
  fixtureDate: Date;
  @Column({ default: false })
  isNotified: boolean;

  @ManyToOne(() => League, (league: League) => league.fixtures)
  league: League;
}
