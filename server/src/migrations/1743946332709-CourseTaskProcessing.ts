import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseTaskProcessing1743946332709 implements MigrationInterface {
  name = 'CourseTaskProcessing1743946332709';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" ADD "isProcessing" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "isProcessing"`);
  }
}
