import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1676139987317 implements MigrationInterface {
  name = 'User1676139987317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "languages" text array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "languages"`);
  }
}
