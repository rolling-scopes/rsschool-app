import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationCategory1661616212488 implements MigrationInterface {
  name = 'NotificationCategory1661616212488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" ADD "parentId" character varying`);
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c" FOREIGN KEY ("parentId") REFERENCES "notification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_b7386b61afc53e6b82251e41b5c"`);
    await queryRunner.query(`ALTER TABLE "notification" DROP COLUMN "parentId"`);
  }
}
