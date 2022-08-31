import { MigrationInterface, QueryRunner } from 'typeorm';

export class RevertResumeUpdate1661973638676 implements MigrationInterface {
  name = 'RevertResumeUpdate1661973638676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "expires" numeric`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "expires"`);
  }
}
