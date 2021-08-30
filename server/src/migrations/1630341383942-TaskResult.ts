import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskResult1630341383942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "task_result"
      SET "lastCheckerId" = CAST("historicalScores"->-1->>'authorId' AS INT)
      WHERE CAST("historicalScores"->-1->>'authorId' AS INT) > 0
    `);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
