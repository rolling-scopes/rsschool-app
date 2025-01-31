import { MigrationInterface, QueryRunner } from "typeorm";

export class CoursePersonalMentoringDates1738250779923 implements MigrationInterface {
  name = 'CoursePersonalMentoringDates1738250779923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "personalMentoringStartDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "course" ADD "personalMentoringEndDate" TIMESTAMP WITH TIME ZONE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "personalMentoringStartDate"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "personalMentoringEndDate"`);
  }
}
