import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseMigration1638302439645 implements MigrationInterface {
  name = 'CourseMigration1638302439645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "personalMentoring" boolean NOT NULL DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "personalMentoring"`);
  }
}
