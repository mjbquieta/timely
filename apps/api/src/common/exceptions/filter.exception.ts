import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    return response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      details: exception.getResponse(),
    });
  }
}

interface ErrorDetails {
  message: string;
  stack: string;
  code: string;
  timestamp: string;
}

export function handleError(error: unknown): never {
  const errorDetails: ErrorDetails = {
    message: error instanceof Error ? error.message : 'Unknown error',
    stack:
      error instanceof Error
        ? (error.stack ?? 'No stack trace available')
        : 'No stack trace available',
    code:
      error instanceof Error && 'code' in error
        ? (error as any).code
        : 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
  };

  if (error instanceof AxiosError) {
    if (error.response?.data) {
      throw new HttpException(
        error.response.data,
        error.response.status || 500,
      );
    }

    throw new HttpException(error.message, error.status || 500);
  }

  if (error instanceof HttpException) {
    throw error;
  }

  throw new InternalServerErrorException(
    errorDetails.message || 'An unexpected error occurred.',
  );
}
