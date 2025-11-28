import { DataSource } from 'typeorm';
import { User } from './users/entity/User';
import dotenv from 'dotenv';
import { Fixture } from './fixtures/entity/Fixture';
import { League } from './leagues/entity/League';
import { Player } from './players/entity/Player';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL,
  //host: process.env.DB_HOST ?? 'localhost',
  // port: parseInt(process.env.DB_PORT ?? '5432'),
  // username: process.env.DB_USERNAME,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME ?? 'postgres',
  synchronize: false,
  logging: true,
  entities: [User, League, Fixture, Player],
  subscribers: [],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  ssl: { rejectUnauthorized: false },
});
