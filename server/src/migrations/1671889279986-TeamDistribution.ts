import { MigrationInterface, QueryRunner } from "typeorm";

export class TeamDistribution1671889279986 implements MigrationInterface {
    name = 'TeamDistribution1671889279986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "team_distribution" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "courseId" integer, "distributionStartDate" TIMESTAMP WITH TIME ZONE, "distributionEndDate" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "PK_432a4b1c8bfacae59140f6fcaf8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_951e2b89c3a2b4554516409cfb" ON "team_distribution" ("courseId") `);
        await queryRunner.query(`CREATE TABLE "student_team_distribution_team_distribution" ("studentId" integer NOT NULL, "teamDistributionId" integer NOT NULL, CONSTRAINT "PK_cd9ddb2e8a915b54f5ab2612bc2" PRIMARY KEY ("studentId", "teamDistributionId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5d15876da767ed2eef032144ca" ON "student_team_distribution_team_distribution" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a939c4402f9eb96a7c2b9b5663" ON "student_team_distribution_team_distribution" ("teamDistributionId") `);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "deletedDate"`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD "teamDistributionId" integer`);
        await queryRunner.query(`ALTER TABLE "team_distribution" ADD CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_5d15876da767ed2eef032144caf" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" ADD CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_a939c4402f9eb96a7c2b9b56634"`);
        await queryRunner.query(`ALTER TABLE "student_team_distribution_team_distribution" DROP CONSTRAINT "FK_5d15876da767ed2eef032144caf"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP CONSTRAINT "FK_f45fe9bce062ecb8f59edf079e8"`);
        await queryRunner.query(`ALTER TABLE "team_distribution" DROP CONSTRAINT "FK_951e2b89c3a2b4554516409cfbd"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "teamDistributionId"`);
        await queryRunner.query(`ALTER TABLE "task" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a939c4402f9eb96a7c2b9b5663"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d15876da767ed2eef032144ca"`);
        await queryRunner.query(`DROP TABLE "student_team_distribution_team_distribution"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_951e2b89c3a2b4554516409cfb"`);
        await queryRunner.query(`DROP TABLE "team_distribution"`);
    }

}
