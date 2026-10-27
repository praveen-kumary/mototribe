import { Injectable, CanActivate, ExecutionContext, ForbiddenException, mixin } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * PBAC (Policy-Based Access Control) Guard ensuring a user owns a resource.
 * Example Usage: @UseGuards(AuthGuard('jwt'), OwnershipGuard('product', 'id'))
 */
export function OwnershipGuard(model: string, idParam = 'id') {
  @Injectable()
  class MixinOwnershipGuard implements CanActivate {
    constructor(public readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
      
      // Administrators override ownership
      if (user.role === 'ADMIN') {
        return true; 
      }

      const resourceId = request.params[idParam] || request.body[idParam];
      if (!resourceId) {
        throw new ForbiddenException(`Resource ID parameter '${idParam}' missing`);
      }

      // Dynamically query the specified Prisma model
      const resource = await (this.prisma as any)[model].findUnique({
        where: { id: resourceId },
        select: { 
          sellerId: true, 
          authorId: true, 
          userId: true, 
          buyerId: true 
        } 
      });

      if (!resource) {
        throw new ForbiddenException('Resource not found');
      }

      // Determine ownership field dynamically
      const ownerId = resource.sellerId || resource.authorId || resource.userId || resource.buyerId;

      if (ownerId !== user.id) {
        throw new ForbiddenException('You do not have permission to access this resource');
      }

      return true;
    }
  }

  return mixin(MixinOwnershipGuard);
}
