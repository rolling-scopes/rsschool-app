import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger(LoggingMiddleware.name);

  public use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();

    res.on('finish', () => {
      this.logger.log({
        msg: 'Processed request',
        url: req.url,
        query: req.query,
        method: req.method,
        status: res.statusCode,
        duration: this.getDurationInMilliseconds(start),
        userId: (req.user as any)?.id ?? null,
      });
    });

    next();
  }

  private getDurationInMilliseconds(start: [number, number]) {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const [diff0, diff1] = process.hrtime(start);
    return (diff0 * NS_PER_SEC + diff1) / NS_TO_MS;
  }
}
