import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { CurrentRequest } from 'src/auth';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: CurrentRequest, res: Response, next: NextFunction) {
    const start = Date.now();
    next();
    this.logger.log({
      msg: 'Processed request',
      url: req.url,
      query: req.query,
      method: req.method,
      status: res.statusCode,
      duration: Date.now() - start,
    });
  }
}
