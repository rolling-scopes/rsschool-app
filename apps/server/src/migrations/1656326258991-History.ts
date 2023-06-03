import { MigrationInterface, QueryRunner } from 'typeorm';

export class History1656326258991 implements MigrationInterface {
  name = 'History1656326258991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "history" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "event" character varying NOT NULL, "entityId" integer, "operation" character varying NOT NULL, "update" json, "previous" json, CONSTRAINT "PK_9384942edf4804b38ca0ee51416" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_a619e6e10deb16bf6519d204cf" ON "history" ("updatedDate") `);
    await queryRunner.query(`CREATE INDEX "IDX_80735bc019562abb4e7099340e" ON "history" ("event") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_80735bc019562abb4e7099340e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a619e6e10deb16bf6519d204cf"`);
    await queryRunner.query(`DROP TABLE "history"`);
  }
}
