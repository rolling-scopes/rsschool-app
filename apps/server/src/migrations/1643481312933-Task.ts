import { MigrationInterface, QueryRunner } from 'typeorm';

export class Task1643481312933 implements MigrationInterface {
  name = 'Task1643481312933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ADD "skills" text NOT NULL DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "skills"`);
  }
}
