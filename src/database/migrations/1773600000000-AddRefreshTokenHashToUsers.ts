import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshTokenHashToUsers1773600000000 implements MigrationInterface {
  name = 'AddRefreshTokenHashToUsers1773600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "refresh_token_hash" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`,
    );
  }
}
