import {MigrationInterface, QueryRunner} from "typeorm";

export class StudentFeedback1638215020747 implements MigrationInterface {
    name = 'StudentFeedback1638215020747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "UQ_7ff4c72c1437996dde5750b27b6"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_adba43a9054da3ee83e6531d7da"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ALTER COLUMN "mentor_id" DROP NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_600ad506d38c98395590e76ea1" ON "student_feedback" ("student_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_adba43a9054da3ee83e6531d7d" ON "student_feedback" ("mentor_id") `);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_feedback" DROP CONSTRAINT "FK_adba43a9054da3ee83e6531d7da"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_adba43a9054da3ee83e6531d7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_600ad506d38c98395590e76ea1"`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ALTER COLUMN "mentor_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "FK_adba43a9054da3ee83e6531d7da" FOREIGN KEY ("mentor_id") REFERENCES "mentor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "student_feedback" ADD CONSTRAINT "UQ_7ff4c72c1437996dde5750b27b6" UNIQUE ("student_id", "mentor_id")`);
    }

}
