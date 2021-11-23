import {MigrationInterface, QueryRunner} from "typeorm";

export class StudentFeedback1637686351309 implements MigrationInterface {
    name = 'StudentFeedback1637686351309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_8d1bc199ec06383ae933039bf2d"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "createdDate"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "updatedDate"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "studentId"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "created_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "updated_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "student_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "mentor_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "content" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "recommendation" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "UQ_7ff4c72c1437996dde5750b27b6" UNIQUE ("student_id", "mentor_id")`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_600ad506d38c98395590e76ea1f" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_adba43a9054da3ee83e6531d7da"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_600ad506d38c98395590e76ea1f"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "UQ_7ff4c72c1437996dde5750b27b6"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "recommendation"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "mentor_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "student_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "updated_date"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "created_date"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "comment" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "updatedDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "createdDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_8d1bc199ec06383ae933039bf2d" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
