import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentMigration1630342025950 implements MigrationInterface {
  name = 'StudentMigration1630342025950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "student"."startDate" IS NULL`);
    await queryRunner.query(`ALTER TABLE "student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01T00:00:00.000Z'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01 00:00:00+00'`);
    await queryRunner.query(`COMMENT ON COLUMN "student"."startDate" IS NULL`);
  }
}
