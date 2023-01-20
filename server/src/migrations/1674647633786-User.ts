import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1674647633786 implements MigrationInterface {
  name = 'User1674647633786';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "languages" text array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "languages"`);
  }
}
