import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizerRoleAndOrganizerId1772893021241 implements MigrationInterface {
    name = 'AddOrganizerRoleAndOrganizerId1772893021241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "organizer_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'organizer', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
        await queryRunner.query(`CREATE INDEX "idx_events_organizer_id" ON "events" ("organizer_id") `);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e"`);
        await queryRunner.query(`DROP INDEX "public"."idx_events_organizer_id"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "organizer_id"`);
    }

}
