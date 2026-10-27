import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditService } from "./audit.service";

/**
 * A generic interceptor to automatically log mutations (POST, PUT, PATCH, DELETE)
 * 
 * Usage:
 * @UseInterceptors(new AuditInterceptor("Product"))
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly entityName: string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit mutations
    if (["GET", "OPTIONS", "HEAD"].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // In a real app, actorId would come from req.user.id (JWT)
        const actorId = req.user?.id || "SYSTEM";
        
        // Entity ID could be in params or returned data
        const entityId = req.params?.id || data?.id || "UNKNOWN";

        const action = `${method}_${this.entityName}`.toUpperCase();

        this.auditService.logAction({
          actorId,
          action,
          entity: this.entityName,
          entityId,
          changes: {
            body: req.body,
            // Depending on strictness, we might log the result data too
          },
        });
      }),
    );
  }
}
