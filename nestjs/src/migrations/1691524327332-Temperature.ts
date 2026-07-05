import { MigrationInterface, QueryRunner } from 'typeorm';

export class Temperature1691524327332 implements MigrationInterface {
  name = 'Temperature1691524327332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompt" DROP COLUMN "temperature"`);
    await queryRunner.query(`ALTER TABLE "prompt" ADD "temperature" double precision NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompt" DROP COLUMN "temperature"`);
    await queryRunner.query(`ALTER TABLE "prompt" ADD "temperature" integer NOT NULL`);
  }
}
