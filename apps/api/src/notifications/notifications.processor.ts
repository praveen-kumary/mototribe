import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'sendEmail':
        await this.handleSendEmail(job.data);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }

    return { status: 'success' };
  }

  private async handleSendEmail(data: any) {
    // Simulate sending email.
    // In production, we'd use SendGrid/SES.
    this.logger.log(`[Email Service] Sent ${data.template} to ${data.to}`);

    // Optionally save to the database to track notification history
    await this.prisma.notification.create({
      data: {
        userId: data.to,
        type: data.template,
        title: data.subject,
        body: `Order amount: ${data.context?.totalAmount || 'N/A'}`,
        read: false,
      }
    });
  }
}
