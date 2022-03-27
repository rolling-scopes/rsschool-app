import { MigrationInterface, QueryRunner } from 'typeorm';

export class Disciplines1647779015475 implements MigrationInterface {
  name = 'Disciplines1647779015475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "discipline" TO "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "discipline" TO "disciplineId"`);
    await queryRunner.query(
      `CREATE TABLE "discipline" ("id" SERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_139512aefbb11a5b2fa92696828" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "task" ADD "disciplineId" integer`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "event" ADD "disciplineId" integer`);
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "event" ADD CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_868c8f954dd31217a7e0981b1d2"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_9e32af93bbf4f4dcf66387b3073"`);
    await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "event" ADD "disciplineId" character varying`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "disciplineId"`);
    await queryRunner.query(`ALTER TABLE "task" ADD "disciplineId" character varying`);
    await queryRunner.query(`DROP TABLE "discipline"`);
    await queryRunner.query(`ALTER TABLE "event" RENAME COLUMN "disciplineId" TO "discipline"`);
    await queryRunner.query(`ALTER TABLE "task" RENAME COLUMN "disciplineId" TO "discipline"`);
  }
}
