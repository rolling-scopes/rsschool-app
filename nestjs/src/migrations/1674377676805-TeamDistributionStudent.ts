import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamDistributionStudent1674377676805 implements MigrationInterface {
  name = 'TeamDistributionStudent1674377676805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team_distribution_student" ("id" SERIAL NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP NOT NULL DEFAULT now(), "studentId" integer NOT NULL, "courseId" integer, "teamDistributionId" integer NOT NULL, "distributed" boolean NOT NULL DEFAULT false, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_a1c39af9e449474f6495b634cd5" UNIQUE ("studentId", "courseId", "teamDistributionId"), CONSTRAINT "PK_8a75ed7468b867aef47a7320188" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_distribution_student" ADD CONSTRAINT "FK_552eb86c51b2449e2665ad7be0f" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_distribution_student" ADD CONSTRAINT "FK_5b0eb057a06b5fafb89edefd358" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_distribution_student" ADD CONSTRAINT "FK_92af6f1f2345cb39398cea4748a" FOREIGN KEY ("teamDistributionId") REFERENCES "team_distribution"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "team_distribution_student" DROP CONSTRAINT "FK_92af6f1f2345cb39398cea4748a"`);
    await queryRunner.query(`ALTER TABLE "team_distribution_student" DROP CONSTRAINT "FK_5b0eb057a06b5fafb89edefd358"`);
    await queryRunner.query(`ALTER TABLE "team_distribution_student" DROP CONSTRAINT "FK_552eb86c51b2449e2665ad7be0f"`);
    await queryRunner.query(`DROP TABLE "team_distribution_student"`);
  }
}
