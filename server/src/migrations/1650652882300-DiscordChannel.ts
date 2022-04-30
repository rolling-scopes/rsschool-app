import { MigrationInterface, QueryRunner } from 'typeorm';

export class DiscordChannel1650652882300 implements MigrationInterface {
  name = 'DiscordChannel1650652882300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "notification_channel" (id) VALUES('discord')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "notification_channel" WHERE "id" = 'discord'`);
  }
}
