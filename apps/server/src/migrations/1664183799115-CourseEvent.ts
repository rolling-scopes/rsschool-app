import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseEvent1664183799115 implements MigrationInterface {
  name = 'CourseEvent1664183799115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_event" ADD "endTime" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_event" DROP COLUMN "endTime"`);
  }
}
