import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamDistribution1673259004920 implements MigrationInterface {
  name = 'TeamDistribution1673259004920';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "resume_id_seq" OWNED BY "resume"."id"`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "id" SET DEFAULT nextval('"resume_id_seq"')`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "id" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "id" SET DEFAULT nextval('resume_id_seq1')`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "resume_id_seq"`);
  }
}
