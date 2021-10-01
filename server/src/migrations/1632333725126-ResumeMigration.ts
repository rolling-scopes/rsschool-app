import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResumeMigration1632333725126 implements MigrationInterface {
  name = 'ResumeMigration1632333725126';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "resume" ("id" SERIAL NOT NULL, "githubId" text NOT NULL, "name" text, "selfIntroLink" text, "startFrom" text, "fullTime" boolean NOT NULL DEFAULT false, "expires" numeric, "militaryService" text, "englishLevel" text, "avatarLink" text, "desiredPosition" text, "notes" text, "phone" text, "email" text, "skype" text, "telegram" text, "linkedin" text, "locations" text, "githubUsername" text, "website" text, "isHidden" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_ee6434baa5d6a66edf5c8fa1229" UNIQUE ("githubId"), CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "resume"`);
  }
}
