import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePrivateRepositories1781107559480 implements MigrationInterface {
  name = 'RemovePrivateRepositories1781107559480';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "usePrivateRepositories"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "repositoryLastActivityDate"`);
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "repository"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_076f71901ba479a51b2deaacd5"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_955719ac67b6cb47bf005b200e"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "repository_event"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "repository_event" ("id" SERIAL NOT NULL, "repositoryUrl" character varying NOT NULL, "action" character varying NOT NULL, "githubId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_861ff064ff09ee2e5bbae703649" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_076f71901ba479a51b2deaacd5" ON "repository_event" ("repositoryUrl")`);
    await queryRunner.query(`CREATE INDEX "IDX_955719ac67b6cb47bf005b200e" ON "repository_event" ("githubId")`);
    await queryRunner.query(`ALTER TABLE "student" ADD "repository" character varying`);
    await queryRunner.query(`ALTER TABLE "student" ADD "repositoryLastActivityDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "course" ADD "usePrivateRepositories" boolean NOT NULL DEFAULT true`);
  }
}
