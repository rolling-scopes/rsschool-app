import { MigrationInterface, QueryRunner } from "typeorm";

export class Course1712137476312 implements MigrationInterface {
    name = 'Course1712137476312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" ADD "certificateThreshold" integer DEFAULT '70'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "course" DROP COLUMN "certificateThreshold"`);
    }

}
