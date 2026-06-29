import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseUsersActivist1693930286280 implements MigrationInterface {
  name = 'CourseUsersActivist1693930286280';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_user" ADD "isActivist" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_user" DROP COLUMN "isActivist"`);
  }
}
