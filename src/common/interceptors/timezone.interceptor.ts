import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor để format timestamp trong response với timezone Vietnam (+07:00)
 * Đảm bảo khi trả về API, timestamp sẽ hiển thị đúng timezone
 */
@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                return this.formatTimestamps(data);
            }),
        );
    }

    /**
     * Recursively format tất cả fields có Date type
     */
    private formatTimestamps(obj: any): any {
        if (!obj) return obj;

        if (obj instanceof Date) {
            // Convert Date sang string với timezone +07:00
            return this.formatDateWithTimezone(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map((item) => this.formatTimestamps(item));
        }

        if (typeof obj === 'object' && obj !== null) {
            const formatted = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    formatted[key] = this.formatTimestamps(obj[key]);
                }
            }
            return formatted;
        }

        return obj;
    }

    /**
     * Format Date sang string với timezone Vietnam
     * Input: Date object (UTC internally)
     * Output: "2026-03-10 15:30:00+07:00" (string)
     */
    private formatDateWithTimezone(date: Date): string {
        const vietnamFormatter = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Ho_Chi_Minh',
        });

        const parts = vietnamFormatter.formatToParts(date);
        const year = parts.find((p) => p.type === 'year')?.value;
        const month = parts.find((p) => p.type === 'month')?.value;
        const day = parts.find((p) => p.type === 'day')?.value;
        const hour = parts.find((p) => p.type === 'hour')?.value;
        const minute = parts.find((p) => p.type === 'minute')?.value;
        const second = parts.find((p) => p.type === 'second')?.value;

        return `${year}-${month}-${day} ${hour}:${minute}:${second}+07:00`;
    }
}
