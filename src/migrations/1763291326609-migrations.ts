import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1763291326609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO league ("fotmobId", name) VALUES (47, 'Premier League');
      INSERT INTO league ("fotmobId", name) VALUES (87, 'La Liga');
      INSERT INTO league ("fotmobId", name) VALUES (54, 'Bundesliga');
      INSERT INTO league ("fotmobId", name) VALUES (55, 'Serie A');
      INSERT INTO league ("fotmobId", name) VALUES (53, 'Ligue 1');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM league WHERE "fotmobId" IN (47, 87, 54, 55, 53);
    `);
  }
}
