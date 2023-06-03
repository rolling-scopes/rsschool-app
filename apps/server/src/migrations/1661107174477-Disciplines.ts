import { MigrationInterface, QueryRunner } from 'typeorm';

export class Disciplines1661107174477 implements MigrationInterface {
  name = 'Disciplines1661107174477';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "disciplineId" integer`);
    await queryRunner.query(
      `ALTER TABLE "course" ADD CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP CONSTRAINT "FK_7dc67e5ff23f9a74b7cb129a088"`);
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "disciplineId"`);
  }
}
