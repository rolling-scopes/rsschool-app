import { MigrationInterface, QueryRunner } from 'typeorm';

export class Student1639502600339 implements MigrationInterface {
  name = 'Student1639502600339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student" ADD "mentoring" boolean DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student" DROP COLUMN "mentoring"`);
  }
}
