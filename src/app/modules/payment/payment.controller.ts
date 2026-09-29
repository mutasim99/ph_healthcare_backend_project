import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe.config";
import { PaymentService } from "./payment.service";
import { sendResponse } from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      signature,
      webhookSecret,
    );
  } catch (error: any) {
    console.error("Webhook signature fail:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const result = await PaymentService.handleStripeWebhook(event);
  res.status(200).json({ success: true, data: result });
});

export const PaymentController = {
  handleStripeWebhookEvent,
};
