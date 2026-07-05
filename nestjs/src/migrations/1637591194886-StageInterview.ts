import { MigrationInterface, QueryRunner } from 'typeorm';

export class StageInterview1637591194886 implements MigrationInterface {
  name = 'StageInterview1637591194886';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_2e4ed1c8264a48ffe7f8547401" ON "stage_interview" ("studentId") `);
    await queryRunner.query(`CREATE INDEX "IDX_db66372bf51271337293b341bf" ON "stage_interview" ("mentorId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_db66372bf51271337293b341bf"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2e4ed1c8264a48ffe7f8547401"`);
  }
}
