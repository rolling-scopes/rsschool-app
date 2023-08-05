import { MigrationInterface, QueryRunner } from 'typeorm';

export class InterviewFeedback1686657350908 implements MigrationInterface {
  name = 'InterviewRating1686657350908';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stage_interview" ADD "rating" integer`);
    await queryRunner.query(`ALTER TABLE "stage_interview_feedback" ADD "version" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stage_interview_feedback" DROP COLUMN "version"`);
    await queryRunner.query(`ALTER TABLE "stage_interview" DROP COLUMN "rating"`);
  }
}
