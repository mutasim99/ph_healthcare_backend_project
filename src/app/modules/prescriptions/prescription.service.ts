import status from "http-status";
import AppError from "../../errorHelper/appError";
import { IRequestUser } from "../../interface/request.interface";
import { prisma } from "../../lib/prisma";
import { ICreatePrescriptionPayload } from "./prescription.interface";
import { generatePrescriptionPDF } from "./prescription.utils";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";

const givePrescription = async (
  user: IRequestUser,
  payload: ICreatePrescriptionPayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
    },
    include: {
      patient: true,
      doctor: {
        include: {
          specialties: true,
        },
      },
      schedule: {
        include: {
          doctorSchedules: true,
        },
      },
    },
  });

  if (appointmentData.doctorId !== doctorData.id) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only give prescription for your own appointments",
    );
  }

  const isAlreadyPrescribed = await prisma.prescription.findFirst({
    where: {
      appointmentId: payload.appointmentId,
    },
  });

  if (isAlreadyPrescribed) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already given prescription for this appointment. You can update the prescription instead.",
    );
  }

  const followupDate = new Date(payload.followUpDate);

  const result = await prisma.$transaction(async (tx) => {
    const result = await tx.prescription.create({
      data: {
        ...payload,
        followupDate,
        doctorId: appointmentData.doctorId,
        patientId: appointmentData.patientId,
      },
    });

    const pdfBuffer = await generatePrescriptionPDF({
      doctorName: doctorData.name,
      doctorEmail: doctorData.email,
      patientName: appointmentData.patient.name,
      patientEmail: appointmentData.patient.email,
      appointmentDate: appointmentData.schedule.startDateTime,
      instructions: payload.instructions,
      followUpDate: result.followupDate,
      prescriptionId: result.id,
      createdAt: new Date(),
    });
    const fileName = `prescription-${Date.now()}.pdf`;
    const uploadFile = await uploadFileToCloudinary(fileName, pdfBuffer);
    const pdfUrl = uploadFile.secure_url
  });
};
