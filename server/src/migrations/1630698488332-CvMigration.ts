import {MigrationInterface, QueryRunner} from "typeorm";

export class CvMigration1630698488332 implements MigrationInterface {
    name = 'CvMigration1630698488332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cv" ("id" SERIAL NOT NULL, "githubId" text NOT NULL, "name" text, "selfIntroLink" text, "startFrom" text, "fullTime" boolean NOT NULL DEFAULT false, "expires" numeric, "militaryService" text, "englishLevel" text, "avatarLink" text, "desiredPosition" text, "notes" text, "phone" text, "email" text, "skype" text, "telegram" text, "linkedin" text, "locations" text, "githubUsername" text, "website" text, "isHidden" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_f21b478fe949f06e4e64d728318" UNIQUE ("githubId"), CONSTRAINT "PK_4ddf7891daf83c3506efa503bb8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "cv"`);
    }

}
