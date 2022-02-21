import { MigrationInterface, QueryRunner } from 'typeorm';

export class RepositoryEvent1645364514538 implements MigrationInterface {
  name = 'RepositoryEvent1645364514538';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "repository_event" ADD "userId" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "repository_event" DROP COLUMN "userId"`);
  }
}
