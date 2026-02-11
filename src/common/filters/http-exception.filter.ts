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
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them into standard API response
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

  /**
   * Extract error message from exception response
   */
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
 * Global Fallback Exception Filter
 * Catches all unhandled errors (non-HTTP exceptions)
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
