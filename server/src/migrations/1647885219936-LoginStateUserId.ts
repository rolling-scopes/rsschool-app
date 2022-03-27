import { MigrationInterface, QueryRunner } from 'typeorm';

export class LoginStateUserId1647885219936 implements MigrationInterface {
  name = 'LoginStateUserId1647885219936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_7d5f118233212829d30962ce3a"`);
    await queryRunner.query(`ALTER TABLE "login_state" ADD "userId" integer`);
    await queryRunner.query(`CREATE INDEX "IDX_79b102f1b191c731920e2ea486" ON "login_state" ("userId") `);

    await queryRunner.query(`ALTER TABLE "login_state" ADD "expires" TIMESTAMP`);
    await queryRunner.query(`CREATE INDEX "IDX_d2236f176c9281802d3ff00d3f" ON "login_state" ("expires") `);

    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" DROP CONSTRAINT "PK_e6e33c165209dbd9cd05f086b1c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" ADD CONSTRAINT "PK_e7ab7a5154b15417e5ee0e31a3b" PRIMARY KEY ("userId", "channelId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" ADD CONSTRAINT "UQ_c1665f13b0eb372fcb8d48ccf6a" UNIQUE ("userId", "channelId", "externalId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_79b102f1b191c731920e2ea486"`);
    await queryRunner.query(`ALTER TABLE "login_state" DROP COLUMN "userId"`);
    await queryRunner.query(`CREATE INDEX "IDX_7d5f118233212829d30962ce3a" ON "notification" ("type") `);
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" DROP CONSTRAINT "UQ_c1665f13b0eb372fcb8d48ccf6a"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_d2236f176c9281802d3ff00d3f"`);
    await queryRunner.query(`ALTER TABLE "login_state" DROP COLUMN "expires"`);

    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" DROP CONSTRAINT "PK_e7ab7a5154b15417e5ee0e31a3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_user_connection" ADD CONSTRAINT "PK_e6e33c165209dbd9cd05f086b1c" PRIMARY KEY ("userId", "channelId", "externalId")`,
    );
  }
}
