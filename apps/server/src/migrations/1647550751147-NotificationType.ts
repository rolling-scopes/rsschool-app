import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationType1647550751147 implements MigrationInterface {
  name = 'NotificationType1647550751147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "scope" TO "type"`);
    await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" SET DEFAULT 'event'`);
    await queryRunner.query(`CREATE INDEX "IDX_33f33cc8ef29d805a97ff4628b" ON "notification" ("type") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ALTER COLUMN "type" SET DEFAULT 'general'`);
    await queryRunner.query(`ALTER TABLE "notification" RENAME COLUMN "type" TO "scope"`);
    await queryRunner.query(`CREATE INDEX "IDX_7d5f118233212829d30962ce3a" ON "notification" ("scope") `);
  }
}
