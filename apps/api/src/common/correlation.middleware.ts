import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from './logger';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    
    // Inject headers back into response for traceability
    res.setHeader('x-correlation-id', correlationId);
    res.setHeader('x-request-id', requestId);

    const store = new Map<string, string>();
    store.set('correlationId', correlationId);
    store.set('requestId', requestId);
    
    // If the user is authenticated, we can optionally store userId/sessionId here too
    // That usually happens in guards, so they would retrieve the store and update it.

    RequestContext.run(store, () => {
      next();
    });
  }
}
