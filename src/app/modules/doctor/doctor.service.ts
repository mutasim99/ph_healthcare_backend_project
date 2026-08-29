import { prisma } from "../../lib/prisma";

const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      specialties: {
        include: {
          specialty: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
  return doctors;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      specialties: {
        select: {
          specialty: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
  return doctor;
};

export const DoctorService = {
  getAllDoctors,
  getDoctorById,
};
