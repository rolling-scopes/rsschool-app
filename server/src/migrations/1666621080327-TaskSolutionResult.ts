import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskSolutionResult1666621080327 implements MigrationInterface {
    name = 'TaskSolutionResult1666621080327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_solution_result" ADD "messages" json NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_solution_result" DROP COLUMN "messages"`);
    }

}
