import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class NoCacheMiddleware implements NestMiddleware {
  public use(_: Request, res: Response, next: NextFunction) {
    res.setHeader('Cache-Control', 'no-cache');
    next();
  }
}
