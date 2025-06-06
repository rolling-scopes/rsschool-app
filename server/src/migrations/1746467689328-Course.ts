import { MigrationInterface, QueryRunner } from 'typeorm';

export class Course1746467689328 implements MigrationInterface {
  name = 'Course1746467689328';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "certificateDisciplines" text DEFAULT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "certificateDisciplines"`);
  }
}
