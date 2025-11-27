import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFixturesForAll1763294076993 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (13, 2025, '2025-11-29 13:00:00', 1);
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (14, 2025, '2025-12-02 17:00:00', 1);
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (15, 2025, '2025-12-06 10:00:00', 1);
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (16, 2025, '2025-12-13 12:00:00', 1);
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (17, 2025, '2025-12-20 10:00:00', 1);
                    INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (18, 2026, '2026-12-26 18:00:00', 1);
                    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    DELETE FROM fixture WHERE "fixtureId" = 12;
                    `);
  }
}
