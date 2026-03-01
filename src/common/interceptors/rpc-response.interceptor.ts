import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface RpcResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable()
export class RpcResponseInterceptor<T> implements NestInterceptor<
  T,
  RpcResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<RpcResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        message: 'OK',
      })),
    );
  }
}
