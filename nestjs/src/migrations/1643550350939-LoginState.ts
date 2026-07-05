import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginState1643550350939 implements MigrationInterface {
  name = 'LoginState1643550350939';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "login_state" ("id" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "data" text NOT NULL, CONSTRAINT "PK_73bea2737e9230e18dc8dc1e7f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_06facda60b88268da22c37ddec" ON "login_state" ("createdDate") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_06facda60b88268da22c37ddec"`);
    await queryRunner.query(`DROP TABLE "login_state"`);
  }
}
