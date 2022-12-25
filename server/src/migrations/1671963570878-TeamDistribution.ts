import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamDistribution1671963570878 implements MigrationInterface {
  name = 'TeamDistribution1671963570878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "discipline" TO "disciplineId"`);
    await queryRunner.query(
      `CREATE TABLE "discipline" ("id" SERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_139512aefbb11a5b2fa92696828" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "task_criteria" ("taskId" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "criteria" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_6de018b8a8dbe8845ffe811ad20" PRIMARY KEY ("taskId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "chatLink" character varying, "password" character varying, "teamDistributionId" integer, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team_distribution" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "courseId" integer, "distributionStartDate" TIMESTAMP WITH TIME ZONE, "distributionEndDate" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying, "minStudents" integer, "maxStudents" integer, "studentsCount" integer, "isStrictStudentsCount" boolean NOT NULL, "minTotalScore" integer, CONSTRAINT "PK_432a4b1c8bfacae59140f6fcaf8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_951e2b89c3a2b4554516409cfb" ON "team_distribution" ("courseId") `);
    await queryRunner.query(
      `CREATE TABLE "history" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "event" character varying NOT NULL, "entityId" integer, "operation" character varying NOT NULL, "update" json, "previous" json, CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a619e6e10deb16bf6519d204cf" ON "history" ("updatedDate") `);
    await queryRunner.query(`CREATE INDEX "IDX_80735bc019562abb4e7099340e" ON "history" ("event") `);
    await queryRunner.query(
      `CREATE TABLE "student_team_distribution_team_distribution" ("studentId" integer NOT NULL, "teamDistributionId" integer NOT NULL, CONSTRAINT "PK_cd9ddb2e8a915b54f5ab2612bc2" PRIMARY KEY ("studentId", "teamDistributionId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5d15876da767ed2eef032144ca" ON "student_team_distribution_team_distribution" ("studentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a939c4402f9eb96a7c2b9b5663" ON "student_team_distribution_team_distribution" ("teamDistributionId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "student_teams_team" ("studentId" integer NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "PK_61c7be2163ef7fd885c6d6c8afc" PRIMARY KEY ("studentId", "teamId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_5fbd9182fe89b2417f288c61f9" ON "student_teams_team" ("studentId") `);
    await queryRunner.query(`CREATE INDEX "IDX_46ecfda37a00bdb0eb9853805e" ON "student_teams_team" ("teamId") `);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "discipline"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "duration"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "special"`);
    await queryRunner.query(`ALTER TABLE "feedback" DROP COLUMN "heroesUrl"`);
    await queryRunner.query(`ALTER TABLE "course" ADD "logo" character varying`);
    await queryRunner.query(`ALTER TABLE "course" ADD "disciplineId" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD "disciplineId" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD "criteriaId" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6" UNIQUE ("criteriaId")`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "crossCheckEndDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(
      `CREATE TYPE "public"."course_task_crosscheckstatus_enum" AS ENUM('initial', 'distributed', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_task" ADD "crossCheckStatus" "public"."course_task_crosscheckstatus_enum" NOT NULL DEFAULT 'initial'`,
    );
    await queryRunner.query(`ALTER TABLE "course_task" ADD "submitText" character varying(1024)`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "validations" text`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "teamDistributionId" integer`);
    await queryRunner.query(`ALTER TABLE "course_event" ADD "endTime" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "notification" ADD "parentId" character varying`);
    await queryRunner.query(`ALTER TABLE "resume" ADD "updatedDate" TIMESTAMP NOT NULL DEFAULT now()`);
    await queryRunner.query(`ALTER TABLE "task_solution_result" ADD "messages" json NOT NULL DEFAULT '[]'`);
    await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f"`);
    await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_fefc350f416e262e904dcf6b35e"`);
    await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "fromUserId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "toUserId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "event" ADD "disciplineId" integer`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6" FOREIGN KEY ("criteriaId") REFERENCES "task_criteria"("taskId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_distribution" ADD CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_task" ADD CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c" FOREIGN KEY ("parentId") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_5d15876da767ed2eef032144caf" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_teams_team" ADD CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_teams_team" ADD CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_teams_team" DROP CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3"`);
    await queryRunner.query(`ALTER TABLE "student_teams_team" DROP CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c"`);
    await queryRunner.query(
      `ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_5d15876da767ed2eef032144caf"`,
    );
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c"`);
    await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2"`);
    await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_fefc350f416e262e904dcf6b35e"`);
    await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd"`);
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073"`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "event" ADD "disciplineId" character varying`);
    await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "toUserId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "fromUserId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "feedback" ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "task_solution_result" DROP COLUMN "messages"`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "updatedDate"`);
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "course_event" DROP COLUMN "endTime"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "teamDistributionId"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "validations"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "submitText"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckStatus"`);
    await queryRunner.query(`DROP TYPE "public"."course_task_crosscheckstatus_enum"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckEndDate"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "criteriaId"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "logo"`);
    await queryRunner.query(`ALTER TABLE "feedback" ADD "heroesUrl" character varying`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "special" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "duration" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD "discipline" character varying`);
    await queryRunner.query(`DROP INDEX "public"."IDX_46ecfda37a00bdb0eb9853805e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5fbd9182fe89b2417f288c61f9"`);
    await queryRunner.query(`DROP TABLE "student_teams_team"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a939c4402f9eb96a7c2b9b5663"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5d15876da767ed2eef032144ca"`);
    await queryRunner.query(`DROP TABLE "student_team_distribution_team_distribution"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_80735bc019562abb4e7099340e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a619e6e10deb16bf6519d204cf"`);
    await queryRunner.query(`DROP TABLE "history"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_951e2b89c3a2b4554516409cfb"`);
    await queryRunner.query(`DROP TABLE "team_distribution"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TABLE "task_criteria"`);
    await queryRunner.query(`DROP TABLE "discipline"`);
    await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "disciplineId" TO "discipline"`);
  }
}
