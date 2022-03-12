import {MigrationInterface, QueryRunner} from "typeorm";

export class CrossCheckScheduling1647103154082 implements MigrationInterface {
    name = 'CrossCheckScheduling1647103154082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_task" ADD "crossCheckEndDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD "crossCheckState" character varying NOT NULL DEFAULT 'initial'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckState"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "crossCheckEndDate"`);
    }

}
