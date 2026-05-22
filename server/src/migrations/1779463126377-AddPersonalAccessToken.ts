import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonalAccessToken1779463126377 implements MigrationInterface {
  name = 'AddPersonalAccessToken1779463126377';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "personal_access_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "name" character varying(100) NOT NULL, "prefix" character(8) NOT NULL, "tokenHash" character(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "lastUsedAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "revokedById" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_personal_access_tokens_prefix" UNIQUE ("prefix"), CONSTRAINT "PK_personal_access_tokens" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_personal_access_tokens_userId" ON "personal_access_tokens" ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "FK_personal_access_tokens_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "FK_personal_access_tokens_revokedById" FOREIGN KEY ("revokedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" DROP CONSTRAINT "FK_personal_access_tokens_revokedById"`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" DROP CONSTRAINT "FK_personal_access_tokens_userId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_personal_access_tokens_userId"`);
    await queryRunner.query(`DROP TABLE "personal_access_tokens"`);
  }
}
