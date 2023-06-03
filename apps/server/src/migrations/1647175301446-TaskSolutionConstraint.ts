import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskSolutionConstraint1647175301446 implements MigrationInterface {
  name = 'TaskSolutionConstraint1647175301446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task_solution" ADD CONSTRAINT "FK_e2487265adac81bea6f085d2fa0" FOREIGN KEY ("courseTaskId") REFERENCES "course_task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task_solution" DROP CONSTRAINT "FK_e2487265adac81bea6f085d2fa0"`);
  }
}
