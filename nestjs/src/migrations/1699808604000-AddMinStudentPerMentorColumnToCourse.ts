import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMinStudentPerMentorColumnToCourse1699808604000 implements MigrationInterface {
  name = 'AddMinStudentPerMentorColumnToCourse1699808604000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" ADD "minStudentsPerMentor" integer DEFAULT '2'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "minStudentsPerMentor"`);
  }
}
