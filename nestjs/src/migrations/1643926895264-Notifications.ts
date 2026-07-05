import { MigrationInterface, QueryRunner } from 'typeorm';

export class Notifications1643926895264 implements MigrationInterface {
  name = 'Notifications1643926895264';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notification_channel" ("id" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_50b36f3daa5dd86f7e707740b23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_user_settings" ("notificationId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "enabled" boolean NOT NULL, "userId" integer NOT NULL, "channelId" character varying NOT NULL, CONSTRAINT "PK_679cad5ff478ef93af7221fd98f" PRIMARY KEY ("notificationId", "userId", "channelId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0b6bedfc9eb1243b01facefe1" ON "notification_user_settings" ("notificationId", "userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a745cd57c268bf3728acbcfccb" ON "notification_user_settings" ("channelId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notification_channel_settings" ("notificationId" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "channelId" character varying NOT NULL, "template" text, CONSTRAINT "PK_6464daee0ff1cf581129618bc8c" PRIMARY KEY ("notificationId", "channelId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_773a8c01eb6d281590cdbcaabd" ON "notification_channel_settings" ("notificationId") `,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_2e2c071fde8ee3f26724de7e67" ON "notification_channel_settings" ("channelId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" character varying NOT NULL, "name" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "scope" character varying NOT NULL DEFAULT 'general', "enabled" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_50802da9f1d09f275d964dd491" ON "notification" ("name") `);
    await queryRunner.query(`CREATE INDEX "IDX_7d5f118233212829d30962ce3a" ON "notification" ("scope") `);
    await queryRunner.query(`CREATE INDEX "IDX_07a7e2f79cde1c82b5be2f4716" ON "notification" ("enabled") `);
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" ADD CONSTRAINT "FK_d58ed9fef5ec0b2875892cda12f" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" ADD CONSTRAINT "FK_8704ffbe765e552c633f5c96588" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" ADD CONSTRAINT "FK_a745cd57c268bf3728acbcfccb1" FOREIGN KEY ("channelId") REFERENCES "notification_channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_channel_settings" ADD CONSTRAINT "FK_773a8c01eb6d281590cdbcaabdf" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_channel_settings" ADD CONSTRAINT "FK_2e2c071fde8ee3f26724de7e678" FOREIGN KEY ("channelId") REFERENCES "notification_channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // set up channels
    await queryRunner.query(`INSERT INTO notification_channel (id) VALUES ('email'),('telegram');`);

    // setup first notifiactions
    await queryRunner.query(
      `INSERT INTO notification (id,name,scope) VALUES
       ('mentorRegistrationApproval', 'Mentor registration approval', 'mentor'),
       ('taskGrade', 'Task grade received', 'student');`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_channel_settings" DROP CONSTRAINT "FK_2e2c071fde8ee3f26724de7e678"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_channel_settings" DROP CONSTRAINT "FK_773a8c01eb6d281590cdbcaabdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" DROP CONSTRAINT "FK_a745cd57c268bf3728acbcfccb1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" DROP CONSTRAINT "FK_8704ffbe765e552c633f5c96588"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_settings" DROP CONSTRAINT "FK_d58ed9fef5ec0b2875892cda12f"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_2e2c071fde8ee3f26724de7e67"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a745cd57c268bf3728acbcfccb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_07a7e2f79cde1c82b5be2f4716"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7d5f118233212829d30962ce3a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_50802da9f1d09f275d964dd491"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_773a8c01eb6d281590cdbcaabd"`);
    await queryRunner.query(`DROP TABLE "notification_channel_settings"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d0b6bedfc9eb1243b01facefe1"`);
    await queryRunner.query(`DROP TABLE "notification_user_settings"`);
    await queryRunner.query(`DROP TABLE "notification_channel"`);
  }
}
