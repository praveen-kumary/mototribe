import { Controller, Post, Headers, Req, BadRequestException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { Request } from "express";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("webhook/razorpay")
  async handleRazorpayWebhook(
    @Headers("x-razorpay-signature") signature: string,
    @Req() req: Request,
  ) {
    if (!signature) {
      throw new BadRequestException("Missing signature");
    }

    // In a real NestJS app, you'd configure rawBody: true in main.ts
    // For this example, we assume req.rawBody exists or we read the buffer.
    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(req.body));
    
    return this.paymentsService.handleRazorpayWebhook(signature, rawBody);
  }
}
