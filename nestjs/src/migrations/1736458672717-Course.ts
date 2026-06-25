import { MigrationInterface, QueryRunner } from 'typeorm';

export class Course1736458672717 implements MigrationInterface {
  name = 'Course1736458672717';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "wearecommunityUrl" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "wearecommunityUrl"`);
  }
}
