import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrossCheckScheduling1647103154082 implements MigrationInterface {
  name = 'CrossCheckScheduling1647103154082';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" ADD "crossCheckEndDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(
      `ALTER TABLE "course_task" ADD "crossCheckStatus" character varying NOT NULL DEFAULT 'initial'`,
    );
    await queryRunner.query(`
      UPDATE course_task AS c
      SET "crossCheckStatus" = 'completed'
      FROM task_result t
      WHERE c.id = t."courseTaskId"
      AND c.checker = 'crossCheck'
      AND (c."studentEndDate" < CURRENT_DATE OR c."studentEndDate" IS NULL)
    `);
    await queryRunner.query(`
      UPDATE course_task AS ct
      SET "crossCheckStatus" = 'distributed'
      FROM (
        SELECT c.id
        FROM course_task AS c
        LEFT JOIN task_result AS t ON t."courseTaskId" = c.id
        WHERE c.checker = 'crossCheck'
        AND t.score IS NULL
        AND c."studentEndDate" < CURRENT_DATE
        GROUP BY c.id
      ) tt
      WHERE ct.id = tt.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckStatus"`);
    await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckEndDate"`);
  }
}
