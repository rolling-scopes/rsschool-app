import { MigrationInterface, QueryRunner } from 'typeorm';

export class PersonalAccessTokenAndAuditLog1779465349517 implements MigrationInterface {
  name = 'PersonalAccessTokenAndAuditLog1779465349517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "personal_access_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "name" character varying(100) NOT NULL, "prefix" character(8) NOT NULL, "tokenHash" character(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "lastUsedAt" TIMESTAMP WITH TIME ZONE, "revokedAt" TIMESTAMP WITH TIME ZONE, "revokedById" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b6dc462fa11dbbb897eb8419735" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_39d8e8e9f17b1d4d4ebe0d8835" ON "personal_access_tokens" ("userId") `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_786fb3eb8a456de6f679d5b34f" ON "personal_access_tokens" ("prefix") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "tokenId" uuid NOT NULL, "action" character varying(120) NOT NULL, "method" character varying(10) NOT NULL, "path" character varying(500) NOT NULL, "resource" character varying(120), "resourceId" character varying(120), "requestPayload" jsonb, "responseStatus" smallint NOT NULL, "durationMs" integer NOT NULL, "ip" character varying(45), "userAgent" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_tokenId_createdAt" ON "audit_log" ("tokenId", "createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_userId_createdAt" ON "audit_log" ("userId", "createdAt") `);
    await queryRunner.query(`ALTER TABLE "user" ADD "isSystem" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "FK_39d8e8e9f17b1d4d4ebe0d88356" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "personal_access_tokens" ADD CONSTRAINT "FK_5c1a8ffb1a64a10d73ad7a18392" FOREIGN KEY ("revokedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_2621409ebc295c5da7ff3e41396" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "audit_log" ADD CONSTRAINT "FK_29cc7e21d5133c7400aedd89ff0" FOREIGN KEY ("tokenId") REFERENCES "personal_access_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_29cc7e21d5133c7400aedd89ff0"`);
    await queryRunner.query(`ALTER TABLE "audit_log" DROP CONSTRAINT "FK_2621409ebc295c5da7ff3e41396"`);
    await queryRunner.query(`ALTER TABLE "personal_access_tokens" DROP CONSTRAINT "FK_5c1a8ffb1a64a10d73ad7a18392"`);
    await queryRunner.query(`ALTER TABLE "personal_access_tokens" DROP CONSTRAINT "FK_39d8e8e9f17b1d4d4ebe0d88356"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isSystem"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_userId_createdAt"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_audit_log_tokenId_createdAt"`);
    await queryRunner.query(`DROP TABLE "audit_log"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_786fb3eb8a456de6f679d5b34f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_39d8e8e9f17b1d4d4ebe0d8835"`);
    await queryRunner.query(`DROP TABLE "personal_access_tokens"`);
  }
}
