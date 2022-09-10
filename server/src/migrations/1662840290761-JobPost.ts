import { MigrationInterface, QueryRunner } from 'typeorm';

export class JobPost1662840290761 implements MigrationInterface {
  name = 'JobPost1662840290761';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_post_status_enum" AS ENUM('draft', 'review', 'published', 'closed', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_post_jobtype_enum" AS ENUM('remote', 'office', 'any', 'hybrid')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_post" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "publishedDate" TIMESTAMP WITH TIME ZONE, "authorId" integer NOT NULL, "status" "public"."job_post_status_enum" NOT NULL DEFAULT 'review', "title" character varying(256) NOT NULL, "description" text NOT NULL, "jobType" "public"."job_post_jobtype_enum" NOT NULL, "location" character varying(256) NOT NULL, "company" character varying(256) NOT NULL, "disciplineId" integer NOT NULL, "url" character varying(1024), CONSTRAINT "PK_a70f902a85e6de57340d153c813" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_1800cb9dae7072e3f12bceb132" ON "job_post" ("authorId") `);
    await queryRunner.query(`CREATE INDEX "IDX_fb852713694dc0227193dda3c8" ON "job_post" ("disciplineId") `);
    await queryRunner.query(
      `CREATE TABLE "job_post_apply" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "jobPostId" integer NOT NULL, CONSTRAINT "PK_ae0c0787ffb8c61f7f502b7ca73" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_0db1ea85a603f13005646ee5d7" ON "job_post_apply" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_46b98c4cf413178578770851b5" ON "job_post_apply" ("jobPostId") `);
    await queryRunner.query(`ALTER TABLE "course_task" ALTER COLUMN "validations" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "job_post" ADD CONSTRAINT "FK_1800cb9dae7072e3f12bceb132b" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_post" ADD CONSTRAINT "FK_fb852713694dc0227193dda3c8f" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_post_apply" ADD CONSTRAINT "FK_0db1ea85a603f13005646ee5d71" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_post_apply" ADD CONSTRAINT "FK_46b98c4cf413178578770851b5d" FOREIGN KEY ("jobPostId") REFERENCES "job_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "job_post_apply" DROP CONSTRAINT "FK_46b98c4cf413178578770851b5d"`);
    await queryRunner.query(`ALTER TABLE "job_post_apply" DROP CONSTRAINT "FK_0db1ea85a603f13005646ee5d71"`);
    await queryRunner.query(`ALTER TABLE "job_post" DROP CONSTRAINT "FK_fb852713694dc0227193dda3c8f"`);
    await queryRunner.query(`ALTER TABLE "job_post" DROP CONSTRAINT "FK_1800cb9dae7072e3f12bceb132b"`);
    await queryRunner.query(`ALTER TABLE "course_task" ALTER COLUMN "validations" SET DEFAULT '[]'`);
    await queryRunner.query(`DROP INDEX "public"."IDX_46b98c4cf413178578770851b5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0db1ea85a603f13005646ee5d7"`);
    await queryRunner.query(`DROP TABLE "job_post_apply"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fb852713694dc0227193dda3c8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1800cb9dae7072e3f12bceb132"`);
    await queryRunner.query(`DROP TABLE "job_post"`);
    await queryRunner.query(`DROP TYPE "public"."job_post_jobtype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_post_status_enum"`);
  }
}
