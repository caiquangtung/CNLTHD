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
 * Transform Response Interceptor
 * Wraps all successful responses in a standard format
 */
@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data || null,
        message: null,
        statusCode: response.statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
