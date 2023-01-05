import { MigrationInterface, QueryRunner } from "typeorm";

export class Resume1672927210327 implements MigrationInterface {
    name = 'Resume1672927210327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "resume" ("id" SERIAL NOT NULL, "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "uuid" uuid DEFAULT uuid_generate_v4(), "userId" integer, "githubId" character varying(256) NOT NULL, "name" character varying(256), "selfIntroLink" character varying(256), "startFrom" character varying(32), "fullTime" boolean NOT NULL DEFAULT false, "expires" numeric, "militaryService" character varying(32), "englishLevel" character varying(8), "avatarLink" character varying(512), "desiredPosition" character varying(256), "notes" text, "phone" character varying(32), "email" character varying(256), "skype" character varying(128), "telegram" character varying(128), "linkedin" character varying(512), "locations" character varying(512), "githubUsername" character varying(256), "website" character varying(512), "isHidden" boolean NOT NULL DEFAULT false, "visibleCourses" integer array NOT NULL DEFAULT '{}', CONSTRAINT "PK_7ff05ea7599e13fac01ac812e48" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6543e24d4d8714017acd1a1b39" ON "resume" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_ee6434baa5d6a66edf5c8fa122" ON "resume" ("githubId") `);
        await queryRunner.query(`ALTER TABLE "resume" ADD CONSTRAINT "FK_6543e24d4d8714017acd1a1b392" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "FK_6543e24d4d8714017acd1a1b392"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ee6434baa5d6a66edf5c8fa122"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6543e24d4d8714017acd1a1b39"`);
        await queryRunner.query(`DROP TABLE "resume"`);
    }

}
