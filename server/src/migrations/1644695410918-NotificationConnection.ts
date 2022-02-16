import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationConnection1644695410918 implements MigrationInterface {
  name = 'NotificationConnection1644695410918';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_user_connection" ("userId" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "channelId" character varying NOT NULL, "externalId" character varying NOT NULL, "enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e6e33c165209dbd9cd05f086b1c" PRIMARY KEY ("userId", "channelId", "externalId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" ADD CONSTRAINT "FK_686acb0bbf9634ef2497e87582f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" ADD CONSTRAINT "FK_8cefc11aa24ba4e51162685196d" FOREIGN KEY ("channelId") REFERENCES "notification_channel"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" DROP CONSTRAINT "FK_8cefc11aa24ba4e51162685196d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" DROP CONSTRAINT "FK_686acb0bbf9634ef2497e87582f"`,
    );
    await queryRunner.query(`DROP TABLE "notification_user_connection"`);
  }
}
