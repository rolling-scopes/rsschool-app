import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResumeUpdatedAt1661699918902 implements MigrationInterface {
  name = 'ResumeUpdatedAt1661699918902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "expires"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "expires" numeric`);
  }
}
