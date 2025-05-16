import { MigrationInterface, QueryRunner } from "typeorm";

export class CourseTaskInterviewCreatingPairs1747380525126 implements MigrationInterface {
    name = 'CourseTaskInterviewCreatingPairs1747380525126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_task" ADD "isCreatingInterviewPairs" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "isCreatingInterviewPairs"`);
    }

}
