import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(@InjectQueue('notifications') private readonly queue: Queue) {}

  @OnEvent('order.created')
  async handleOrderCreated(payload: { orderId: string, buyerId: string, totalAmount: number }) {
    this.logger.log(`Queueing notification for order ${payload.orderId}`);
    await this.queue.add('sendEmail', {
      to: payload.buyerId,
      subject: 'Order Confirmation',
      template: 'order-created',
      context: payload
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
