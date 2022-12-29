import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamDistribution1672313929108 implements MigrationInterface {
  name = 'TeamDistribution1672313929108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "startDate" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "endDate" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "description" SET DEFAULT ''`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "description" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "endDate" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "team_distribution" ALTER COLUMN "startDate" DROP NOT NULL`);
  }
}
