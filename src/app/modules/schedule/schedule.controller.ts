import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ScheduleServices } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interface/query.interface";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const schedule = await ScheduleServices.createSchedule(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Schedule created successfully",
    data: schedule,
  });
});

const getAllSchedule = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ScheduleServices.getAllSchedule(query as IQueryParams);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "All schedule retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const schedule = await ScheduleServices.getScheduleById(id as string);

  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule retrieved successfully",
    data: schedule,
  });
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const updateSchedule = await ScheduleServices.updateSchedule(
    id as string,
    payload,
  );
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule updated successfully",
    data: updateSchedule,
  });
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleteSchedule = await ScheduleServices.deleteSchedule(id as string);
  sendResponse(res, {
    success: true,
    httpStatusCode: status.OK,
    message: "Schedule deleted successfully",
    data: updateSchedule,
  });
});

export const ScheduleController = {
  createSchedule,
  getAllSchedule,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
