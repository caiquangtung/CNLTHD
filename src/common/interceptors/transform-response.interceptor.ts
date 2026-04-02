import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

/**
 * Static helper để format timestamp
 */
export class DateFormatterHelper {
  static formatDateWithTimezone(date: Date): string {
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

  static formatDatesDeep<T>(value: T): T {
    if (value === null || value === undefined) {
      return value;
    }

    if (value instanceof Date) {
      return DateFormatterHelper.formatDateWithTimezone(value) as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => DateFormatterHelper.formatDatesDeep(item)) as T;
    }

    if (typeof value === 'object') {
      const formatted: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        formatted[key] = DateFormatterHelper.formatDatesDeep(item);
      }
      return formatted as T;
    }

    return value;
  }
}

/**
 * Interceptor chuẩn hóa phản hồi HTTP.
 *
 * - Bọc mọi dữ liệu trả về của controller vào cùng một cấu trúc `ApiResponse<T>`.
 * - Format timestamp trong response metadata về múi giờ Việt Nam (+07:00).
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          data: data ? DateFormatterHelper.formatDatesDeep(data) : null,
          message: null,
          statusCode: response.statusCode,
          timestamp: DateFormatterHelper.formatDateWithTimezone(new Date()),
          path: request.url,
        };
      }),
    );
  }
}
