import { MigrationInterface, QueryRunner } from 'typeorm';

export class Resume1652870756742 implements MigrationInterface {
  name = 'Resume1652870756742';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "updatedDate" TIMESTAMP NOT NULL DEFAULT now()`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "updatedDate"`);
  }
}
