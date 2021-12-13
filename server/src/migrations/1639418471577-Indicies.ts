import {MigrationInterface, QueryRunner} from "typeorm";

export class Indicies1639418471577 implements MigrationInterface {
    name = 'Indicies1639418471577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_87c5a426accd8659ac76e8d3fb" ON "course_task" ("disabled") `);
        await queryRunner.query(`CREATE INDEX "IDX_e848fe0c47f23605364a5f163f" ON "student" ("isFailed") `);
        await queryRunner.query(`CREATE INDEX "IDX_f277c5f942b6421c4e02e4b959" ON "student" ("isExpelled") `);
        await queryRunner.query(`CREATE INDEX "IDX_d0a655e0bd36811dc5e74a1b64" ON "task_verification" ("updatedDate") `);
        await queryRunner.query(`CREATE INDEX "IDX_d8959fe22a43ff7773b3640992" ON "task_verification" ("studentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dae85baef040e0c3eaf1794ff6" ON "task_verification" ("courseTaskId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_dae85baef040e0c3eaf1794ff6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8959fe22a43ff7773b3640992"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0a655e0bd36811dc5e74a1b64"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f277c5f942b6421c4e02e4b959"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e848fe0c47f23605364a5f163f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87c5a426accd8659ac76e8d3fb"`);
    }

}
