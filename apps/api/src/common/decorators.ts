import { createParamDecorator, ExecutionContext, SetMetadata } from "@nestjs/common";

/**
 * Extracts the authenticated user from the request object.
 * Usage: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);

/**
 * Declares which roles are allowed to access a route.
 * Usage: @Roles('ADMIN', 'SELLER')
 */
export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
