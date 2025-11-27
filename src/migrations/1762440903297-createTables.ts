import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1762440903297 implements MigrationInterface {
    name = 'CreateTables1762440903297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fixture" ("id" SERIAL NOT NULL, "fixtureId" integer NOT NULL, "seasonId" integer NOT NULL, "fixtureDate" TIMESTAMP NOT NULL, "leagueId" integer, CONSTRAINT "PK_d9634ba06480dc240af97ad548c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "league" ("id" SERIAL NOT NULL, "fotmobId" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "player" ("id" SERIAL NOT NULL, "fotmobId" character varying NOT NULL, "fullName" character varying NOT NULL, "teamName" character varying NOT NULL, "teamId" character varying NOT NULL, "leagueId" integer, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "telegramId" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_players_player" ("userId" integer NOT NULL, "playerId" integer NOT NULL, CONSTRAINT "PK_7df666f03e8b868ddd5a2eabf81" PRIMARY KEY ("userId", "playerId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1b92eaf2f6258b58d16ac33291" ON "user_players_player" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2c43dfe81a9ab1d39cd3bd818" ON "user_players_player" ("playerId") `);
        await queryRunner.query(`ALTER TABLE "fixture" ADD CONSTRAINT "FK_1e2340d2298cd198a18d8695c35" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "player" ADD CONSTRAINT "FK_c1803677be7fb5e9ec5544adccf" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_players_player" ADD CONSTRAINT "FK_1b92eaf2f6258b58d16ac332912" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_players_player" ADD CONSTRAINT "FK_b2c43dfe81a9ab1d39cd3bd8182" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_players_player" DROP CONSTRAINT "FK_b2c43dfe81a9ab1d39cd3bd8182"`);
        await queryRunner.query(`ALTER TABLE "user_players_player" DROP CONSTRAINT "FK_1b92eaf2f6258b58d16ac332912"`);
        await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_c1803677be7fb5e9ec5544adccf"`);
        await queryRunner.query(`ALTER TABLE "fixture" DROP CONSTRAINT "FK_1e2340d2298cd198a18d8695c35"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2c43dfe81a9ab1d39cd3bd818"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b92eaf2f6258b58d16ac33291"`);
        await queryRunner.query(`DROP TABLE "user_players_player"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "player"`);
        await queryRunner.query(`DROP TABLE "league"`);
        await queryRunner.query(`DROP TABLE "fixture"`);
    }

}
