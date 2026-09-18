import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelper/appError";
import status from "http-status";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = (
  fileName: string,
  buffer: Buffer,
): Promise<UploadApiResponse> => {
  if (!buffer || !fileName) {
    throw new AppError(status.BAD_REQUEST, "Filename and buffer is required");
  }

  const extension = fileName.split(".").pop()?.toLocaleLowerCase();

  const fileNameWithoutExtension = fileName
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    // eslint-disable-next-line no-useless-escape
    .replace(/[^a-z0-9\-]/g, "");

  const uniqueName =
    Math.random().toString(36).substring(2) +
    "-" +
    Date.now() +
    "-" +
    fileNameWithoutExtension;

  const folder = extension === "pdf" ? "pdfs" : "images";

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          public_id: `medicare/${folder}/${uniqueName}`,
          folder: `medicare/${folder}`,
        },
        (error, result) => {
          if (error) {
            return reject(
              new AppError(
                status.INTERNAL_SERVER_ERROR,
                "failed to upload file to cloudinary",
              ),
            );
          }
          resolve(result as UploadApiResponse);
        },
      )
      .end(buffer);
  });
};

export const deleteFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.+?)(?:\.[a-zA-Z0-9]+)+$/;
    const match = url.match(regex);

    if (match && match[1]) {
      const publicId = match[1];

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
      console.log(`File ${publicId} delete form cloudinary`);
    }
  } catch (error) {
    console.log(`Error from cloudinary delete`);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Error happening when delete from cloudinary",
    );
  }
};

export const cloudinaryUpload = cloudinary;
