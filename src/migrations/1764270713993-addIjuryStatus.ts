import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIjuryStatus1764270713993 implements MigrationInterface {
  name = 'AddIjuryStatus1764270713993';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "fixture" ADD "isNotified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD "injuryStatus" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD "expectedReturn" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "player" DROP COLUMN "expectedReturn"`,
    );
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "injuryStatus"`);
    await queryRunner.query(`ALTER TABLE "fixture" DROP COLUMN "isNotified"`);
  }
}
