import {MigrationInterface, QueryRunner} from "typeorm";

export class Feedback1648320921100 implements MigrationInterface {
    name = 'Feedback1648320921100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" DROP COLUMN "heroesUrl"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_fefc350f416e262e904dcf6b35e"`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "fromUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "toUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_fefc350f416e262e904dcf6b35e"`);
        await queryRunner.query(`ALTER TABLE "feedback" DROP CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f"`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "toUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ALTER COLUMN "fromUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_fefc350f416e262e904dcf6b35e" FOREIGN KEY ("toUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD CONSTRAINT "FK_bfea5673b7379b1adfa2036da3f" FOREIGN KEY ("fromUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback" ADD "heroesUrl" character varying`);
    }

}
