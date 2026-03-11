import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Set timezone cho database để đảm bảo tất cả timestamps đúng Vietnam timezone
 */
export class SetDatabaseTimezone1773000000001 implements MigrationInterface {
    name = 'SetDatabaseTimezone1773000000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Set timezone cho current session
        await queryRunner.query(`SET timezone = 'Asia/Ho_Chi_Minh'`);

        // Set timezone cho database (nếu có quyền superuser)
        try {
            const dbName = await queryRunner.query(`SELECT current_database()`);
            const currentDb = dbName[0].current_database;
            await queryRunner.query(
                `ALTER DATABASE "${currentDb}" SET timezone = 'Asia/Ho_Chi_Minh'`,
            );
        } catch (error) {
            // Nếu không có quyền superuser, không xảy ra lỗi, chỉ log warning
            console.warn(
                `⚠️ Warning: Cannot set database timezone (requires superuser privileges). Using connection-level timezone instead.`,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            const dbName = await queryRunner.query(`SELECT current_database()`);
            const currentDb = dbName[0].current_database;
            // Reset về UTC (default)
            await queryRunner.query(`ALTER DATABASE "${currentDb}" RESET timezone`);
        } catch (error) {
            console.warn(`⚠️ Warning: Cannot reset database timezone`);
        }
    }
}
