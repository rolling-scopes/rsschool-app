import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

const NS_PER_SEC = 1e9;
const NS_TO_MS = 1e6;

type RawResponse = {
  statusCode: number;
  on: (event: 'finish', listener: () => void) => void;
};

/**
 * Request logging as a global interceptor (was an Express middleware). The log
 * line is still emitted on the raw response 'finish' event so the recorded
 * status includes whatever exception filters wrote. Unlike the middleware,
 * interceptors only see matched routes that passed their guards, so unknown
 * routes (404) and guard-rejected requests (401/403) are no longer logged.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = process.hrtime();
    const http = context.switchToHttp();
    const req = http.getRequest<{ url: string; query: unknown; method: string; user?: { id: number } }>();
    // FastifyReply exposes the node response as `raw`; on Express the response
    // object is the raw http.ServerResponse itself.
    const res = http.getResponse<RawResponse & { raw?: RawResponse }>();
    const rawResponse = res.raw ?? res;

    rawResponse.on('finish', () => {
      this.logger.log({
        msg: 'Processed request',
        url: req.url,
        query: req.query,
        method: req.method,
        status: rawResponse.statusCode,
        duration: this.getDurationInMilliseconds(start),
        userId: req.user?.id ?? null,
      });
    });

    return next.handle();
  }

  private getDurationInMilliseconds(start: [number, number]) {
    const [diff0, diff1] = process.hrtime(start);
    return (diff0 * NS_PER_SEC + diff1) / NS_TO_MS;
  }
}
