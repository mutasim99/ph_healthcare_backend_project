import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to create patient");
  }

  const patient = await prisma.$transaction(async (tx) => {
    const patientTx = await tx.patient.create({
      data: {
        userId: data.user.id,
        name: data.user.name,
        email: data.user.email,
      },
    });
    return patientTx;
  });

  return {
    user: data.user,
    patient,
  };
};

interface ILoginPatientPayload {
  email: string;
  password: string;
}

const signInUser = async (payload: ILoginPatientPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (data.user?.status === UserStatus.BLOCKED) {
    throw new Error("Account Blocked");
  }

  if (data.user?.isDeleted || data.user?.status === UserStatus.DELETED) {
    throw new Error("This account is deleted");
  }

  return data;
};

export const AUthService = {
  registerPatient,
  signInUser,
};
