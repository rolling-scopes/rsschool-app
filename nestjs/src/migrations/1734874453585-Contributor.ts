import { MigrationInterface, QueryRunner } from 'typeorm';

export class Contributor1734874453585 implements MigrationInterface {
  name = 'Contributor1734874453585';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contributor" ("id" SERIAL NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP NOT NULL DEFAULT now(), "deleted_date" TIMESTAMP, "user_id" integer NOT NULL, "description" character varying NOT NULL, CONSTRAINT "REL_16ce6a76e8a6808b976a61db48" UNIQUE ("user_id"), CONSTRAINT "PK_816afef005b8100becacdeb6e58" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_16ce6a76e8a6808b976a61db48" ON "contributor" ("user_id") `);
    await queryRunner.query(`ALTER TABLE "user" ADD "contributor_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_aadfefeabbf834e1bb67c9fec0a" UNIQUE ("contributor_id")`,
    );
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "certificateThreshold" SET NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "contributor" ADD CONSTRAINT "FK_16ce6a76e8a6808b976a61db487" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_aadfefeabbf834e1bb67c9fec0a" FOREIGN KEY ("contributor_id") REFERENCES "contributor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_aadfefeabbf834e1bb67c9fec0a"`);
    await queryRunner.query(`ALTER TABLE "contributor" DROP CONSTRAINT "FK_16ce6a76e8a6808b976a61db487"`);
    await queryRunner.query(`ALTER TABLE "course" ALTER COLUMN "certificateThreshold" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_aadfefeabbf834e1bb67c9fec0a"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "contributor_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_16ce6a76e8a6808b976a61db48"`);
    await queryRunner.query(`DROP TABLE "contributor"`);
  }
}
