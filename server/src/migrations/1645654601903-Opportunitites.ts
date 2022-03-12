import { MigrationInterface, QueryRunner } from 'typeorm';

export class Opportunitites1645654601903 implements MigrationInterface {
  name = 'Opportunitites1645654601903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" ADD "uuid" uuid DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`ALTER TABLE "resume" ADD "userId" integer`);
    await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "UQ_ee6434baa5d6a66edf5c8fa1229"`);

    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "githubId" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "name" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "selfIntroLink" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "startFrom" TYPE character varying(32)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "militaryService" TYPE character varying(32)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "englishLevel" TYPE character varying(8)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "avatarLink" TYPE character varying(512)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "desiredPosition" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "phone" TYPE character varying(32)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "email" TYPE character varying(128)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "skype" TYPE character varying(128)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "telegram" TYPE character varying(128)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "linkedin" TYPE character varying(128)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "locations" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "githubUsername" TYPE character varying(256)`);
    await queryRunner.query(`ALTER TABLE "resume" ALTER COLUMN "website" TYPE character varying(256)`);

    await queryRunner.query(`CREATE INDEX "IDX_6543e24d4d8714017acd1a1b39" ON "resume" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_ee6434baa5d6a66edf5c8fa122" ON "resume" ("githubId") `);
    await queryRunner.query(
      `ALTER TABLE "resume" ADD CONSTRAINT "FK_6543e24d4d8714017acd1a1b392" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resume" DROP CONSTRAINT "FK_6543e24d4d8714017acd1a1b392"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ee6434baa5d6a66edf5c8fa122"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6543e24d4d8714017acd1a1b39"`);
    await queryRunner.query(`ALTER TABLE "resume" ADD CONSTRAINT "UQ_ee6434baa5d6a66edf5c8fa1229" UNIQUE ("githubId")`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "resume" DROP COLUMN "uuid"`);
  }
}
