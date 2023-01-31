import { MigrationInterface, QueryRunner } from 'typeorm';

export class User1675182702772 implements MigrationInterface {
  name = 'User1675182702772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_languages_enum" AS ENUM('English', 'Chinese', 'Hindi', 'Spanish', 'French', 'Arabic', 'Bengali', 'Russian', 'Portuguese', 'Indonesian', 'Urdu', 'Japanese', 'German', 'Punjabi', 'Telugu', 'Turkish', 'Korean', 'Marathi', 'Kyrgyz', 'Kazakh', 'Uzbek', 'Georgian', 'Polish', 'Lithuanian', 'Latvian', 'Belarusian', 'Ukrainian')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "languages" "public"."user_languages_enum" array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "languages"`);
    await queryRunner.query(`DROP TYPE "public"."user_languages_enum"`);
  }
}
