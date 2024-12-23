import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseTask1730926720293 implements MigrationInterface {
  name = 'CourseTask1730926720293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" ADD "studentRegistrationStartDate" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "studentRegistrationStartDate"`);
  }
}
