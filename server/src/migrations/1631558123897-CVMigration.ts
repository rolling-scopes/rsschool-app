import { MigrationInterface, QueryRunner } from 'typeorm';

export class CVMigration1631558123897 implements MigrationInterface {
  name = 'CVMigration1631558123897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."cv" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ADD "locations" text`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ADD "isHidden" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ALTER COLUMN "fullTime" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ALTER COLUMN "fullTime" SET DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."cv" ALTER COLUMN "fullTime" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ALTER COLUMN "fullTime" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "public"."cv" DROP COLUMN "isHidden"`);
    await queryRunner.query(`ALTER TABLE "public"."cv" DROP COLUMN "locations"`);
    await queryRunner.query(`ALTER TABLE "public"."cv" ADD "location" text`);
  }
}
