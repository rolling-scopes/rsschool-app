import { MigrationInterface, QueryRunner } from 'typeorm';

export class Temperature1691520611773 implements MigrationInterface {
  name = 'Temperature1691520611773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompt" ADD "temperature" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "prompt" DROP COLUMN "temperature"`);
  }
}
