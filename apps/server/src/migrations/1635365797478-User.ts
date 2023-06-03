import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1635365797478 implements MigrationInterface {
  name = 'User1635365797478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "providerUserId" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "user" ADD "provider" character varying(32)`);
    await queryRunner.query(`CREATE INDEX "IDX_d223b6ab8859d668ab080c3628" ON "user" ("providerUserId") `);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_bbaf6a936b2124dc6448ba3448f" UNIQUE ("providerUserId", "provider")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_bbaf6a936b2124dc6448ba3448f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d223b6ab8859d668ab080c3628"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "provider"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "providerUserId"`);
  }
}
