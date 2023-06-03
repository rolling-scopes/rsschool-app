import { MigrationInterface, QueryRunner } from 'typeorm';

export class Tasks1671475396333 implements MigrationInterface {
  name = 'Tasks1671475396333';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ADD "deletedDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "deletedDate"`);
  }
}
