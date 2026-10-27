export interface CreatePaymentIntentDto {
  amount: number; // in paise
  currency: string;
  orderId: string;
}

export interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
        [key: string]: any;
      };
    };
  };
}
