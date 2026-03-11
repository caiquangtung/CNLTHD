import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEventOrganizerOnDelete1773500000000 implements MigrationInterface {
  name = 'UpdateEventOrganizerOnDelete1773500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing FK constraint (ON DELETE NO ACTION)
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e"`,
    );

    // Re-create FK with ON DELETE SET NULL so events remain when user is deleted
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_organizer_id" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_events_organizer_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_14c9ce53a2c2a1c781b8390123e" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
