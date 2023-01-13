import { MigrationInterface, QueryRunner } from 'typeorm';

export class Team1673597606496 implements MigrationInterface {
  name = 'Team1673597606496';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" ADD "teamLeadId" integer`);
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "name" SET DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "teamDistributionId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "description" SET DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "chatLink" SET DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "password" SET DEFAULT ''`);
    await queryRunner.query(`CREATE INDEX "IDX_79279baf9c5c6e3fb9baabbb5b" ON "team" ("teamDistributionId") `);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team" DROP CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_79279baf9c5c6e3fb9baabbb5b"`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "password" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "chatLink" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "description" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "teamDistributionId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team" ALTER COLUMN "name" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_79279baf9c5c6e3fb9baabbb5bd" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`ALTER TABLE "team" DROP COLUMN "teamLeadId"`);
  }
}
