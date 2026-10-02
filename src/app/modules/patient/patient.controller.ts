import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { patientService } from "./patient.service";
import { IRequestUser } from "../../interface/request.interface";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser;
  const payload = req.body;

  const result = await patientService.updateMyProfile(user, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const patientController = {
  updateMyProfile,
};
