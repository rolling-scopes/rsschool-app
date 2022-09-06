import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseTask1662275601017 implements MigrationInterface {
  name = 'CourseTask1662275601017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "duration"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "special"`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "submitText" character varying(1024)`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "validations" text`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckStatus"`);
    await queryRunner.query(
      `CREATE TYPE "public"."course_task_crosscheckstatus_enum" AS ENUM('initial', 'distributed', 'completed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_task" ADD "crossCheckStatus" "public"."course_task_crosscheckstatus_enum" NOT NULL DEFAULT 'initial'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckStatus"`);
    await queryRunner.query(`DROP TYPE "public"."course_task_crosscheckstatus_enum"`);
    await queryRunner.query(
      `ALTER TABLE "course_task" ADD "crossCheckStatus" character varying NOT NULL DEFAULT 'initial'`,
    );
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "validations"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "submitText"`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "special" character varying NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "course_task" ADD "duration" integer`);
  }
}
