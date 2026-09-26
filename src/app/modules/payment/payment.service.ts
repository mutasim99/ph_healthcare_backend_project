import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";

const handleStripeWebhook = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventID: event.id,
    },
  });
  if (existingPayment) {
    console.log(`Event ${event.id} already processed. skipping`);
    return { message: `Event ${event.id} already processed. skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;
      const paymentId = session.metadata?.paymentId;
      if (!appointmentId || !paymentId) {
        console.error(`Incomplete metadata for event ${event.id}`);
        return { message: `Incomplete metadata for event ${event.id}` };
      }
      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });
      if (!appointment) {
        console.error(`Appointment not found for event ${event.id}`);
        return { message: `Appointment not found for event ${event.id}` };
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });

        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            stripeEventID: event.id,
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
          },
        });
      });
      console.log(
        `processed checkout.session.complete for appointment ${appointmentId} and payment ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} failed. Marking associated payment as failed.`,
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const session = event.data.object;
      console.log(
        `Payment intent ${session.id} failed. Marking associated payment as failed.`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  return { message: `Event ${event.id} processed successfully` };
};

export const PaymentService = {
  handleStripeWebhook,
};
