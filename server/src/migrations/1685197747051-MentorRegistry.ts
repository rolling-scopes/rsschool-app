import { MigrationInterface, QueryRunner } from 'typeorm';

export class MentorRegistry1685197747051 implements MigrationInterface {
  name = 'MentorRegistry1685197747051';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "comment" character varying`);
    await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "receivedDate" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "mentor_registry" ADD "sendDate" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "sendDate"`);
    await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "receivedDate"`);
    await queryRunner.query(`ALTER TABLE "mentor_registry" DROP COLUMN "comment"`);
  }
}
