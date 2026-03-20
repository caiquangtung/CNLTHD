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
 * Interceptor chuẩn hóa phản hồi HTTP.
 *
 * - Bọc mọi dữ liệu trả về của controller (events, ticket-types, users,...)
 *   vào cùng một cấu trúc `ApiResponse<T>`.
 * - Đồng thời chuẩn hóa toàn bộ thời gian về múi giờ Việt Nam (+07:00).
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
        // Chuẩn hóa toàn bộ thời gian trong dữ liệu về múi giờ +07:00
        const formattedData = this.formatTimestamps(data);

        return {
          success: true,
          data: formattedData || null,
          message: null,
          statusCode: response.statusCode,
          timestamp: this.formatDateWithTimezone(new Date()),
          path: request.url,
        };
      }),
    );
  }

  /** Duyệt đệ quy và format mọi trường có kiểu Date. */
  private formatTimestamps(obj: any): any {
    if (!obj) return obj;

    if (obj instanceof Date) {
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
   * Chuyển đối tượng Date sang chuỗi theo múi giờ Việt Nam (+07:00).
   * Ví dụ: "2026-03-10 15:30:00+07:00".
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
