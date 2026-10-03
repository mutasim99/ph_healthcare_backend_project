import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { generateInvoicePdf } from "./payment.utils";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";

const handleStripeWebhook = async (event: Stripe.Event) => {
  console.log("EVENT", event.type, event.id);
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
        include: {
          patient: true,
          doctor: true,
          schedule: true,
          payment: true,
        },
      });
      if (!appointment) {
        console.error(`Appointment not found for event ${event.id}`);
        return { message: `Appointment not found for event ${event.id}` };
      }

      let pdfBuffer: Buffer | null = null;

      const result = await prisma.$transaction(async (tx) => {
        const updatedAppointment = await tx.appointment.update({
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

        let invoiceUrl = null;

        if (session.payment_status === "paid") {
          try {
            pdfBuffer = await generateInvoicePdf({
              invoiceId: appointment.payment?.id || paymentId,
              patientName: appointment.patient.name,
              patientEmail: appointment.patient.email,
              doctorName: appointment.doctor.name,
              appointmentDate:
                appointment.schedule.startDateTime.toLocaleString(),
              amount: appointment.payment?.amount as number,
              transactionId: appointment.payment?.transactionId as string,
              paymentDate: new Date().toISOString(),
            });

            const cloudinaryResponse = await uploadFileToCloudinary(
              `Autism-healthcare/invoice/invoice-${paymentId}-${Date.now()}.pdf`,
              pdfBuffer,
            );
            invoiceUrl = cloudinaryResponse.secure_url;

            console.log(
              `✅ Invoice PDF generated and uploaded for payment ${paymentId}`,
            );
          } catch (pdfError) {
            console.error(
              "❌ Error generating/uploading invoice PDF:",
              pdfError,
            );
          }
        }

        const updatedPayment = await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            paymentGatewayData: session as any,
            invoiceUrl: invoiceUrl,
            stripeEventID: event.id,
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
        return { updatedPayment, invoiceUrl, updatedAppointment };
      });

      if (session.payment_status === "paid" && result.invoiceUrl) {
        try {
          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              patientName: appointment.patient.name,
              invoiceId: appointment.payment?.id || paymentId,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toLocaleDateString(),
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              invoiceUrl: result.invoiceUrl,
            },
            attachments: [
              {
                fileName: `Invoice-${paymentId}.pdf`,
                content: pdfBuffer || Buffer.from(""),
                contentType: "application/pdf",
              },
            ],
          });
          console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
        } catch (emailError) {
          console.error("❌ Error sending invoice email:", emailError);
        }
      }

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
