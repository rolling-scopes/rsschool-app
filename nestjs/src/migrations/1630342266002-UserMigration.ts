import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMigration1630342266002 implements MigrationInterface {
  name = 'UserMigration1630342266002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" DROP CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" DROP CONSTRAINT "FK_277a1b8395fd2896391b01b7612"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01T00:00:00.000Z'`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" ADD CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59" FOREIGN KEY ("interviewQuestionId") REFERENCES "interview_question"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" ADD CONSTRAINT "FK_277a1b8395fd2896391b01b7612" FOREIGN KEY ("interviewQuestionCategoryId") REFERENCES "interview_question_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" DROP CONSTRAINT "FK_277a1b8395fd2896391b01b7612"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" DROP CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59"`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01 00:00:00+00'`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" ADD CONSTRAINT "FK_277a1b8395fd2896391b01b7612" FOREIGN KEY ("interviewQuestionCategoryId") REFERENCES "interview_question_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "public"."interview_question_categories_interview_question_category" ADD CONSTRAINT "FK_0b3c9d5127523db43a8c4997f59" FOREIGN KEY ("interviewQuestionId") REFERENCES "interview_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
