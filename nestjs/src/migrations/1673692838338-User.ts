import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1673692838338 implements MigrationInterface {
  name = 'User1673692838338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "contactsWhatsApp" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "contactsWhatsApp"`);
  }
}
