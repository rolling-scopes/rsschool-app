import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMigration1630340371992 implements MigrationInterface {
  name = 'UserMigration1630340371992';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_result" ADD "lastCheckerId" integer`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."discord" IS NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "discord" SET DEFAULT null`);
    await queryRunner.query(`COMMENT ON COLUMN "student"."startDate" IS NULL`);
    await queryRunner.query(`ALTER TABLE "student" ALTER COLUMN "startDate" SET DEFAULT '"1970-01-01T00:00:00.000Z"'`);
    await queryRunner.query(
      `ALTER TABLE "task_result" ADD CONSTRAINT "FK_0d531a05b39c159334a1724e1b0" FOREIGN KEY ("lastCheckerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_result" DROP CONSTRAINT "FK_0d531a05b39c159334a1724e1b0"`);
    await queryRunner.query(`ALTER TABLE "task_result" DROP COLUMN "lastCheckerId"`);
  }
}
