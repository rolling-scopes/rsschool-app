import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskCriteria1666348642811 implements MigrationInterface {
  name = 'TaskCriteria1666348642811';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "task_criteria" ("taskId" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "criteria" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_6de018b8a8dbe8845ffe811ad20" PRIMARY KEY ("taskId"))`,
    );
    await queryRunner.query(`ALTER TABLE "task" ADD "criteriaId" integer`);
    await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6" UNIQUE ("criteriaId")`);
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6" FOREIGN KEY ("criteriaId") REFERENCES "task_criteria"("taskId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_91f8c79680ddb1486f56128a9d6"`);
    await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "UQ_91f8c79680ddb1486f56128a9d6"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "criteriaId"`);
    await queryRunner.query(`DROP TABLE "task_criteria"`);
  }
}
