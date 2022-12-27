import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamDistribution1672141430404 implements MigrationInterface {
    name = 'TeamDistribution1672141430404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "chatLink" character varying NOT NULL, "password" character varying NOT NULL, "teamDistributionId" integer, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "team_distribution" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "courseId" integer, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "description" character varying NOT NULL, "minStudents" integer DEFAULT '2', "maxStudents" integer, "studentsCount" integer DEFAULT '3', "strictStudentsCount" boolean NOT NULL DEFAULT true, "minTotalScore" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_432a4b1c8bfacae59140f6fcaf8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_951e2b89c3a2b4554516409cfb" ON "team_distribution" ("courseId") `);
        await queryRunner.query(`CREATE TABLE "student_team_distribution_team_distribution" ("studentId" integer NOT NULL, "teamDistributionId" integer NOT NULL, CONSTRAINT "PK_cd9ddb2e8a915b54f5ab2612bc2" PRIMARY KEY ("studentId", "teamDistributionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5d15876da767ed2eef032144ca" ON "student_team_distribution_team_distribution" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a939c4402f9eb96a7c2b9b5663" ON "student_team_distribution_team_distribution" ("teamDistributionId") `);
        await queryRunner.query(`CREATE TABLE "student_teams_team" ("studentId" integer NOT NULL, "teamId" integer NOT NULL, CONSTRAINT "PK_61c7be2163ef7fd885c6d6c8afc" PRIMARY KEY ("studentId", "teamId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5fbd9182fe89b2417f288c61f9" ON "student_teams_team" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_46ecfda37a00bdb0eb9853805e" ON "student_teams_team" ("teamId") `);
        await queryRunner.query(`ALTER TABLE "course_task" ADD "teamDistributionId" integer`);
        await queryRunner.query(`ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "team_distribution" ADD CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_5d15876da767ed2eef032144caf" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_teams_team" ADD CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "student_teams_team" ADD CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_teams_team" DROP CONSTRAINT "FK_46ecfda37a00bdb0eb9853805e3"`);
        await queryRunner.query(`ALTER TABLE "student_teams_team" DROP CONSTRAINT "FK_5fbd9182fe89b2417f288c61f9c"`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634"`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_5d15876da767ed2eef032144caf"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8"`);
        await queryRunner.query(`ALTER TABLE "team_distribution" DROP CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd"`);
        await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "teamDistributionId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_46ecfda37a00bdb0eb9853805e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5fbd9182fe89b2417f288c61f9"`);
        await queryRunner.query(`DROP TABLE "student_teams_team"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a939c4402f9eb96a7c2b9b5663"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d15876da767ed2eef032144ca"`);
        await queryRunner.query(`DROP TABLE "student_team_distribution_team_distribution"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_951e2b89c3a2b4554516409cfb"`);
        await queryRunner.query(`DROP TABLE "team_distribution"`);
        await queryRunner.query(`DROP TABLE "team"`);
    }

}
