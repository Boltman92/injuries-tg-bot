import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeaguesAndFixtures1764861974378 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert leagues
    await queryRunner.query(`
      INSERT INTO league ("fotmobId", name) VALUES (48, 'Championship');
      INSERT INTO league ("fotmobId", name) VALUES (40, 'Belgian Pro League');
      INSERT INTO league ("fotmobId", name) VALUES (61, 'Liga Portugal');
      INSERT INTO league ("fotmobId", name) VALUES (57, 'Eredivisie');
      INSERT INTO league ("fotmobId", name) VALUES (268, 'Brazilian Serie A');
    `);

    // Insert fixtures using subquery to get the correct league IDs
    await queryRunner.query(`
      INSERT INTO fixture ("fixtureId", "seasonId", "fixtureDate", "leagueId") 
      VALUES 
        (19, 2025, '2025-12-05 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 48)),
        (20, 2025, '2025-12-09 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 48)),
        (21, 2025, '2026-01-19 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 48)),
        (22, 2026, '2026-01-26 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 48)),
        (17, 2025, '2025-12-05 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 40)),
        (17, 2025, '2025-12-12 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 40)),
        (18, 2025, '2025-12-19 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 40)),
        (19, 2025, '2025-12-26 11:00:00', (SELECT id FROM league WHERE "fotmobId" = 40)),
        (20, 2026, '2026-01-17 12:00:00', (SELECT id FROM league WHERE "fotmobId" = 40)),
        (13, 2025, '2025-12-05 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 61)),
        (14, 2025, '2025-12-13 13:00:00', (SELECT id FROM league WHERE "fotmobId" = 61)),
        (15, 2025, '2025-12-19 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 61)),
        (16, 2026, '2025-12-27 15:00:00', (SELECT id FROM league WHERE "fotmobId" = 61)),
        (17, 2026, '2026-01-02 15:00:00', (SELECT id FROM league WHERE "fotmobId" = 61)),
        (18, 2025, '2025-12-13 13:00:00', (SELECT id FROM league WHERE "fotmobId" = 57)),
        (19, 2025, '2025-12-20 13:00:00', (SELECT id FROM league WHERE "fotmobId" = 57)),
        (20, 2025, '2026-01-09 17:00:00', (SELECT id FROM league WHERE "fotmobId" = 57));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DELETE FROM league WHERE "fotmobId" IN (48, 40, 61, 57, 268);
    `);
  }
}
