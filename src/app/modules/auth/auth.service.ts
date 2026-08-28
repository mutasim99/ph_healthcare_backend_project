import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../../lib/auth";

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

  return data;
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
