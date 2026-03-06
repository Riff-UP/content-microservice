import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Catch()
export class GlobalRpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): Observable<any> {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
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
}
