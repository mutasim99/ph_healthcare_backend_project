import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AUthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await AUthService.registerPatient(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

const signInUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AUthService.signInUser(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "User login successfully",
    data: result,
  });
});

export const AuthController = {
  registerPatient,
  signInUser,
};
