import {MigrationInterface, QueryRunner} from "typeorm";

export class Update1639427578702 implements MigrationInterface {
    name = 'Update1639427578702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course_task" DROP CONSTRAINT "FK_33927c9b6369c34ee32f7084215"`);
        await queryRunner.query(`ALTER TABLE "stage_interview" DROP CONSTRAINT "FK_47cb62b5215db20cd02ce51305c"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_8d1bc199ec06383ae933039bf2d"`);
        await queryRunner.query(`ALTER TABLE "course_event" DROP CONSTRAINT "FK_50d7cfb1d0d26c574bb64ffb869"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_33927c9b6369c34ee32f708421"`);
        await queryRunner.query(`ALTER TABLE "course_task" DROP COLUMN "stageId"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "createdDate"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "updatedDate"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "studentId"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "created_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "updated_date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "deleted_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "student_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "mentor_id" integer`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "content" json NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "recommendation" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "english_level" character varying(8)`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "author_id" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_600ad506d38c98395590e76ea1" ON "student_feedback" ("student_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_adba43a9054da3ee83e6531d7d" ON "student_feedback" ("mentor_id") `);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_600ad506d38c98395590e76ea1f" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_f133ab9aba2bb7c28da9a93351d"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_adba43a9054da3ee83e6531d7da"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_600ad506d38c98395590e76ea1f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_adba43a9054da3ee83e6531d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_600ad506d38c98395590e76ea1"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "author_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "english_level"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "recommendation"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "mentor_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "student_id"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "deleted_date"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "updated_date"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP COLUMN "created_date"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "studentId" integer`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "comment" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "updatedDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD "createdDate" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD "stageId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_33927c9b6369c34ee32f708421" ON "course_task" ("stageId") `);
        await queryRunner.query(`ALTER TABLE "course_event" ADD CONSTRAINT "FK_50d7cfb1d0d26c574bb64ffb869" FOREIGN KEY ("stageId") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_8d1bc199ec06383ae933039bf2d" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stage_interview" ADD CONSTRAINT "FK_47cb62b5215db20cd02ce51305c" FOREIGN KEY ("stageId") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_task" ADD CONSTRAINT "FK_33927c9b6369c34ee32f7084215" FOREIGN KEY ("stageId") REFERENCES "stage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
