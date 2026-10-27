import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export const RequestContext = new AsyncLocalStorage<Map<string, string>>();

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  
  formatContext(): string {
    const store = RequestContext.getStore();
    const correlationId = store?.get('correlationId');
    const sessionId = store?.get('sessionId');
    
    let ctxString = this.context ? `[${this.context}] ` : '';
    if (correlationId) {
      ctxString += `[Corr: ${correlationId}] `;
    }
    if (sessionId) {
      ctxString += `[Session: ${sessionId}] `;
    }
    return ctxString;
  }

  log(message: any, context?: string) {
    if (context) this.context = context;
    super.log(`${this.formatContext()}${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    if (context) this.context = context;
    super.error(`${this.formatContext()}${message}`, trace);
  }

  warn(message: any, context?: string) {
    if (context) this.context = context;
    super.warn(`${this.formatContext()}${message}`);
  }

  debug(message: any, context?: string) {
    if (context) this.context = context;
    super.debug(`${this.formatContext()}${message}`);
  }
}
