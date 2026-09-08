import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AUthService } from "./auth.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelper/appError";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AUthService.registerPatient(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken!);
  tokenUtils.setRefreshToken(res, refreshToken!);
  tokenUtils.setBetterAuthSessionCookie(res, token as string);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Patient created successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const signInUser = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await AUthService.signInUser(payload);

  const { accessToken, refreshToken, token, ...rest } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken!);
  tokenUtils.setRefreshToken(res, refreshToken!);
  tokenUtils.setBetterAuthSessionCookie(res, token);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User login successfully",
    data: {
      token,
      accessToken,
      refreshToken,
      ...rest,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  console.log(user);

  const result = await AUthService.getMe(user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  const betterAuthSessionToken = req.cookies["better-auth.session_token"];
  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "Refresh token is required");
  }

  const result = await AUthService.getNewToken(
    refreshToken,
    betterAuthSessionToken,
  );

  const {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken,
  } = result;

  tokenUtils.setAccessTokenCookie(res, newAccessToken);
  tokenUtils.setRefreshToken(res, newRefreshToken);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "New token generated successfully",
    data: {
      newAccessToken,
      newRefreshToken,
      sessionToken,
    },
  });
});

export const AuthController = {
  registerPatient,
  signInUser,
  getMe,
  getNewToken,
};
