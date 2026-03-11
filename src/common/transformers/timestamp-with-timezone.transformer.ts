import { ValueTransformer } from 'typeorm';

/**
 * Transformer để giữ nguyên timezone khi lấy dữ liệu từ database
 * PostgreSQL sẽ trả về: 2026-03-10 15:30:00+07:00
 * Transformer sẽ parse và giữ nguyên timezone offset
 */
export class TimestampWithTimeZoneTransformer implements ValueTransformer {
    /**
     * Khi lấy từ database
     */
    from(value: any): Date | null {
        if (!value) return null;

        // PostgreSQL trả về string như: "2026-03-10T15:30:00+07:00"
        // Parse nó và convert về JavaScript Date
        return new Date(value);
    }

    /**
     * Khi lưu vào database
     * Để DB handle qua DEFAULT, không send value từ code
     */
    to(value: any): any {
        if (!value) return null;

        // Nếu là Date, convert về ISO string
        if (value instanceof Date) {
            return value.toISOString();
        }

        return value;
    }
}
