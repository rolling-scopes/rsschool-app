import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResumeSelectCourses1642884123347 implements MigrationInterface {
  name = 'ResumeSelectCourses1642884123347';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "visibleCourses" integer array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "visibleCourses"`);
  }
}
