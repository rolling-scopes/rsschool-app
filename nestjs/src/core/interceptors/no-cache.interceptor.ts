import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Disables client-side caching on GET responses (was an Express middleware).
 * The header is written through the http adapter so the interceptor works
 * unchanged on both Express and Fastify.
 */
@Injectable()
export class NoCacheInterceptor implements NestInterceptor {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<{ method: string }>();
    if (req.method === 'GET') {
      this.httpAdapterHost.httpAdapter.setHeader(http.getResponse(), 'Cache-Control', 'no-cache');
    }
    return next.handle();
  }
}
