  import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { ApiResponse } from '../interfaces/api-response.interface';

  /**
   * Bộ lọc lỗi HTTP dùng chung cho toàn bộ ứng dụng.
   *
   * Được đăng ký ở mức global để mọi lỗi HTTP (từ module events, ticket-types,...)
   * đều trả về đúng cấu trúc `ApiResponse` thay vì response mặc định của Nest.
   */
  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
      const status = exception.getStatus();

      const exceptionResponse = exception.getResponse();
      const message = this.extractMessage(exceptionResponse);

      // Log error for debugging
      this.logger.error(
        `[${request.method}] ${request.url} - Status: ${status} - Message: ${message}`,
      );

      const errorResponse: ApiResponse = {
        success: false,
        data: null,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(status).json(errorResponse);
    }

    /** Tách nội dung thông báo lỗi từ đối tượng exception. */
    private extractMessage(exceptionResponse: string | object): string {
      if (typeof exceptionResponse === 'string') {
        return exceptionResponse;
      }

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const message = (exceptionResponse as any).message;

        // Handle validation errors (array of messages)
        if (Array.isArray(message)) {
          return message.join(', ');
        }

        return message;
      }

      return 'An error occurred';
    }
  }

  /**
   * Bộ lọc lỗi dự phòng cho mọi loại lỗi không phải HttpException.
   *
   * Đảm bảo mọi API (events, tickets,...) luôn trả về JSON chuẩn,
   * không để lộ stacktrace hay lỗi thô ra phía client.
   */
  @Catch()
  export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();

      const status =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;

      const message =
        exception instanceof Error
          ? exception.message
          : 'Internal server error';

      // Log critical error
      this.logger.error(
        `[${request.method}] ${request.url} - Unhandled Error`,
        exception instanceof Error ? exception.stack : exception,
      );

      const errorResponse: ApiResponse = {
        success: false,
        data: null,
        message,
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      response.status(status).json(errorResponse);
    }
  }
