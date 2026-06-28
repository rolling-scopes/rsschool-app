import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentMigration1630347897950 implements MigrationInterface {
  name = 'StudentMigration1630347897950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01T00:00:00.000Z'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."student" ALTER COLUMN "startDate" SET DEFAULT '1970-01-01 00:00:00+00'`,
    );
  }
}
