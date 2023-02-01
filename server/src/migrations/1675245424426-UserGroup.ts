import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserGroup1675245424426 implements MigrationInterface {
  name = 'UserGroup1675245424426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_user" ADD "isDementor" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_user" DROP COLUMN "isDementor"`);
  }
}
