import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseLogo1649868994688 implements MigrationInterface {
  name = 'CourseLogo1649868994688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseActiveLogoUrl"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "courseArchivedLogoUrl"`);
    await queryRunner.query(`ALTER TABLE "course" ADD "logo" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "logo"`);
    await queryRunner.query(`ALTER TABLE "course" ADD "courseArchivedLogoUrl" character varying`);
    await queryRunner.query(`ALTER TABLE "course" ADD "courseActiveLogoUrl" character varying`);
  }
}
