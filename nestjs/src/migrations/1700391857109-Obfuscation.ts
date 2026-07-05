import { MigrationInterface, QueryRunner } from 'typeorm';

export class Obfuscation1700391857109 implements MigrationInterface {
  name = 'Obfuscation1700391857109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "obfuscated" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "obfuscated"`);
  }
}
