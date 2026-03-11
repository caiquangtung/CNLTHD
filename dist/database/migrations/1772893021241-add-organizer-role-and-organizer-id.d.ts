import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddOrganizerRoleAndOrganizerId1772893021241 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
