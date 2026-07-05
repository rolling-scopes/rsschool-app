import { MigrationInterface, QueryRunner } from 'typeorm';

export class Course1675345245770 implements MigrationInterface {
  name = 'Course1675345245770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f"`);
    await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_30d559218724a6d6e0cc4f26b0e" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "fullName" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "alias" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_8a167196d86062fa6abf6f0d546" UNIQUE ("alias")`);
    await queryRunner.query(`CREATE INDEX "IDX_8a167196d86062fa6abf6f0d54" ON "course" ("alias") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_8a167196d86062fa6abf6f0d54"`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_8a167196d86062fa6abf6f0d546"`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "alias" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "fullName" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_30d559218724a6d6e0cc4f26b0e"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f" UNIQUE ("name", "alias")`,
    );
  }
}
