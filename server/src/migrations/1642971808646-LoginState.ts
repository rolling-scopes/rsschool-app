import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginState1642971808646 implements MigrationInterface {
  name = 'LoginState1642971808646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "login_state" ("id" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "data" text NOT NULL, CONSTRAINT "PK_bcb528a96855c4138837cf7f340" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "login_state"`);
  }
}
