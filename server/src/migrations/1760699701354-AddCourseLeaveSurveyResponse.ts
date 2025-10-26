import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseLeaveSurveyResponse1760699701354 implements MigrationInterface {
  name = 'AddCourseLeaveSurveyResponse1760699701354';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "course_leave_survey_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "courseId" integer NOT NULL, "reasonForLeaving" text array, "otherComments" text, "submittedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da291c26b3b92584820c0d02323" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_leave_survey_responses" ADD CONSTRAINT "FK_bb5c64d5636045dbeaf485b7c75" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_leave_survey_responses" ADD CONSTRAINT "FK_c86a19923266180ab9ad289df04" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_leave_survey_responses" DROP CONSTRAINT "FK_c86a19923266180ab9ad289df04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_leave_survey_responses" DROP CONSTRAINT "FK_bb5c64d5636045dbeaf485b7c75"`,
    );
    await queryRunner.query(`DROP TABLE "course_leave_survey_responses"`);
  }
}
