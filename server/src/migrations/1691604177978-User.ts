import { MigrationInterface, QueryRunner } from "typeorm";

export class User1691604177978 implements MigrationInterface {
  name = 'User1691604177978'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "jobFound" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "user" ADD "jobFoundCompanyName" character varying`);
    await queryRunner.query(`ALTER TABLE "user" ADD "jobFoundOfficeLocation" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "jobFoundOfficeLocation"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "jobFoundCompanyName"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "jobFound"`);
  }

}
