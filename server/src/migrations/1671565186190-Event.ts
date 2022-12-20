import { MigrationInterface, QueryRunner } from "typeorm";

export class Event1671565186190 implements MigrationInterface {
    name = 'Event1671565186190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" ADD "deletedDate" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event" DROP COLUMN "deletedDate"`);
    }

}
