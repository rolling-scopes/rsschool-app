import { MigrationInterface, QueryRunner } from 'typeorm';

export class Team1674128274839 implements MigrationInterface {
  name = 'Team1674128274839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "minStudents"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "studentsCount"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "maxStudents"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "strictStudentsCount"`);
    await queryRunner.query(`ALTER TABLE "team" ADD "teamLeadId" integer`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "minTeamSize" integer NOT NULL DEFAULT '2'`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "maxTeamSize" integer NOT NULL DEFAULT '4'`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "strictTeamSize" integer NOT NULL DEFAULT '3'`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "strictTeamSizeMode" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "teamDistributionId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "description" SET DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "chatLink" DROP NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_79279baf9c5c6e3fb9baabbb5b" ON "team" ("teamDistributionId") `);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_79279baf9c5c6e3fb9baabbb5b"`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "chatLink" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "description" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "teamDistributionId" DROP NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "strictTeamSizeMode"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "strictTeamSize"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "maxTeamSize"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" DROP COLUMN "minTeamSize"`);
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "teamLeadId"`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "strictStudentsCount" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "maxStudents" integer NOT NULL DEFAULT '4'`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "studentsCount" integer NOT NULL DEFAULT '3'`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ADD "minStudents" integer NOT NULL DEFAULT '2'`);
  }
}
