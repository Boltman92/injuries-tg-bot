import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMoreFixtures1764337688500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (14, 2025, '2025-11-29 13:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (15, 2025, '2025-12-05 17:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (16, 2025, '2025-12-12 17:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (17, 2025, '2025-12-19 17:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (18, 2025, '2026-01-04 15:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (19, 2026, '2026-01-11 15:00:00', 2);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (12, 2025, '2025-11-28 20:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (15, 2025, '2025-12-05 17:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (16, 2025, '2025-12-12 17:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (17, 2025, '2025-12-19 17:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (18, 2025, '2026-01-09 16:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (19, 2026, '2026-01-13 15:00:00', 3);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (14, 2025, '2025-11-28 20:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (15, 2025, '2025-12-06 11:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (16, 2025, '2025-12-12 17:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (17, 2025, '2025-12-20 14:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (18, 2025, '2026-12-27 10:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (19, 2026, '2026-01-02 18:00:00', 4);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (14, 2025, '2025-11-28 20:00:00', 5);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (15, 2025, '2025-12-05 17:00:00', 5);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (16, 2025, '2025-12-12 17:00:00', 5);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (17, 2025, '2025-01-02 17:00:00', 5);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (18, 2025, '2026-01-16 16:00:00', 5);
        INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") VALUES (19, 2026, '2026-01-23 16:00:00', 5);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM fixture WHERE "fixtureId" IN (14, 15, 16, 17, 18);
        `);
  }
}
