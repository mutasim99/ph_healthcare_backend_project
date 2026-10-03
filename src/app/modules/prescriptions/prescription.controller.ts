import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { prescriptionService } from "./prescription.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const givePrescription = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const user = req.user;
  const result = await prescriptionService.givePrescription(user, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription given successfully",
    data: result,
  });
});

const myPrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await prescriptionService.myPrescriptions(user);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "My prescriptions fetched successfully",
    data: result,
  });
});

const getAllPrescriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await prescriptionService.getAllPrescriptions();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All prescriptions fetched successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  const payload = req.body;
  const result = await prescriptionService.updatePrescription(
    user,
    prescriptionId as string,
    payload,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription updated successfully",
    data: result,
  });
});

const deletePrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const prescriptionId = req.params.id;
  const result = await prescriptionService.deletePrescription(
    user,
    prescriptionId as string,
  );
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Prescription deleted successfully",
    data: result,
  });
});

export const prescriptionController = {
  givePrescription,
  myPrescription,
  getAllPrescriptions,
  updatePrescription,
  deletePrescription,
};
