import { MigrationInterface, QueryRunner } from "typeorm";

export class InterviewVersion1686671656058 implements MigrationInterface {
    name = 'InterviewVersion1686671656058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "receivedDate"`);
        await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "sendDate"`);
        await queryRunner.query(`ALTER TABLE "stage_interview_feedback" ADD "version" integer`);
        await queryRunner.query(`ALTER TABLE "stage_interview" ADD "rating" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stage_interview" DROP COLUMN "rating"`);
        await queryRunner.query(`ALTER TABLE "stage_interview_feedback" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "sendDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "receivedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "comment" character varying`);
    }

}
