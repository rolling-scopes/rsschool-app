import {MigrationInterface, QueryRunner} from "typeorm";

export class StudentFeedback1638215898561 implements MigrationInterface {
    name = 'StudentFeedback1638215898561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "deleted_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "deleted_date"`);
    }

}
