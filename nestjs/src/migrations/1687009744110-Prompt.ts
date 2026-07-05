import { MigrationInterface, QueryRunner } from 'typeorm';

export class Prompt1687009744110 implements MigrationInterface {
  name = 'Prompt1687009744110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "prompt" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying(256) NOT NULL, "text" character varying NOT NULL, CONSTRAINT "UQ_8b52c9f9bf5ffaba2f772c65456" UNIQUE ("type"), CONSTRAINT "PK_d8e3aa07a95560a445ad50fb931" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "prompt"`);
  }
}
