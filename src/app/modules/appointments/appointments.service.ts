import { uuidv7 } from "zod";
import { IRequestUser } from "../../interface/request.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointments.interface";
import AppError from "../../errorHelper/appError";
import status from "http-status";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findFirstOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findFirstOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: doctorData.id,
        patientId: patientData.id,
        scheduleId: scheduleData.id,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });
    return appointmentData;
  });
  return result;
};

const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user?.email,
    },
  });
  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user?.email,
    },
  });

  let appointments = [];
  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      },
    });
  } else {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
  return appointments;
};
