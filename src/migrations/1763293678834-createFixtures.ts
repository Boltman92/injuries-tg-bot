import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixtures1763293678834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (12, 2025, '2025-11-22 10:00:00', 1);
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                DELETE FROM fixture WHERE "fixtureId" = 12;
                `);
  }
}
