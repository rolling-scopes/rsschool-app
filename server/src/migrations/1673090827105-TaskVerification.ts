import { MigrationInterface, QueryRunner } from "typeorm";

export class TaskVerification1673090827105 implements MigrationInterface {
    name = 'TaskVerification1673090827105'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_verification" ADD "answers" json NOT NULL DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_verification" DROP COLUMN "answers"`);
    }

}
