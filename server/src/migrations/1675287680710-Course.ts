import { MigrationInterface, QueryRunner } from 'typeorm';

export class Course1675287680710 implements MigrationInterface {
  name = 'Course1675287680710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_1c6a31a1098e0c472c4196f85d"`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f"`);
    await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_30d559218724a6d6e0cc4f26b0e" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "fullName" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "alias" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ADD CONSTRAINT "UQ_8a167196d86062fa6abf6f0d546" UNIQUE ("alias")`);
    await queryRunner.query(`CREATE INDEX "alias" ON "course" () `);
    await queryRunner.query(`CREATE INDEX "discordServerId" ON "course" () `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."discordServerId"`);
    await queryRunner.query(`DROP INDEX "public"."alias"`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_8a167196d86062fa6abf6f0d546"`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "alias" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "fullName" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "UQ_30d559218724a6d6e0cc4f26b0e"`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "UQ_fc5c908f913cd7188a018775f5f" UNIQUE ("name", "alias")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_1c6a31a1098e0c472c4196f85d" ON "course" ("discordServerId") `);
  }
}
