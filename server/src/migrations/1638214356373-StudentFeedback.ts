import {MigrationInterface, QueryRunner} from "typeorm";

export class StudentFeedback1638214356373 implements MigrationInterface {
    name = 'StudentFeedback1638214356373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "english_level" character varying(8) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "author_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "recommendation"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "recommendation" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "recommendation"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "recommendation" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "english_level"`);
    }

}
