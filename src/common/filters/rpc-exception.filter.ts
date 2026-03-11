import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Catch()
export class GlobalRpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      const responseBody =
        typeof response === 'string'
          ? { message: response }
          : ((response ?? {}) as Record<string, unknown>);
      const message =
        typeof responseBody.message === 'string'
          ? responseBody.message
          : exception.message;

      const rpcError = new RpcException({
        statusCode,
        code: this.mapStatusToCode(statusCode),
        message,
        ...responseBody,
      });

      return super.catch(rpcError, host);
    }

    const error = exception as Error;
    this.logger.error(
      `Unhandled exception: ${error?.message ?? exception}`,
      error?.stack,
    );

    const rpcError = new RpcException({
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: error?.message ?? 'Internal server error',
    });

    return super.catch(rpcError, host);
  }

  private mapStatusToCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'HTTP_EXCEPTION';
    }
  }
}
