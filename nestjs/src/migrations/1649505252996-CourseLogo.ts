import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseLogo1649505252996 implements MigrationInterface {
  name = 'CourseLogo1649505252996';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "courseActiveLogoUrl" character varying`);
    await queryRunner.query(`ALTER TABLE "course" ADD "courseArchivedLogoUrl" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseArchivedLogoUrl"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseActiveLogoUrl"`);
  }
}
