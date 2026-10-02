import z from "zod";
import { BloodGroup, Gender } from "../../../generated/prisma/enums";

const updatePatientProfileZodSchema = z.object({
  patientInfo: z
    .object({
      name: z
        .string("Name is must be string")
        .min(1, "Name can to be empty")
        .max(100, "Name csn not be longer than 100 character")
        .optional(),
      profilePhoto: z.url("Profile photo is must be a valid url").optional(),
      contactNumber: z
        .string("contact number is must be an string")
        .min(6, "it can not be less than 6 character")
        .max(17, "Number can to be longer than 17 character")
        .optional(),
      address: z
        .string("Address is must me a string")
        .min(5, "Address can not be shorter than 5 character")
        .max(200, "Address must be less than 200 character")
        .optional(),
    })
    .optional(),
  patientHealthData: z
    .object({
      gender: z.enum([Gender.FEMALE, Gender.MALE, Gender.OTHER]).optional(),
      dateOfBirth: z
        .string()
        .refine((date) => !isNaN(Date.parse(date)), {
          message: "Invalid date format",
        })
        .optional(),
      bloodGroup: z
        .enum([
          BloodGroup.A_POSITIVE,
          BloodGroup.A_NEGATIVE,
          BloodGroup.B_POSITIVE,
          BloodGroup.B_NEGATIVE,
          BloodGroup.AB_POSITIVE,
          BloodGroup.AB_NEGATIVE,
          BloodGroup.O_POSITIVE,
          BloodGroup.O_NEGATIVE,
        ])
        .optional(),
      hasAllergies: z.boolean().optional(),
      hasDiabetes: z.boolean().optional(),
      height: z.string().optional(),
      weight: z.string().optional(),
      smokingStatus: z.boolean().optional(),
      dietaryPreferences: z.string().optional(),
      pregnancyStatus: z.boolean().optional(),
      mentalHealthHistory: z.string().optional(),
      immunizationStatus: z.string().optional(),
      hasPastSurgeries: z.boolean().optional(),
      recentAnxiety: z.boolean().optional(),
      recentDepression: z.boolean().optional(),
      maritalStatus: z.string().optional(),
    })
    .optional(),
  medicalReports: z
    .array(
      z.object({
        shouldDelete: z.boolean().optional(),
        reportId: z.uuid().optional(),
        reportName: z.string().optional(),
        reportLink: z.url().optional(),
      }),
    )
    .optional()
    .refine(
      (reports) => {
        if (!reports || reports.length === 0) {
          return true;
        }

        for (const report of reports) {
          /* Case-1 */
          if (report.shouldDelete === true && !report.reportId) {
            return false;
          }
          /* Case-2 */
          if (report.reportId && !report.shouldDelete) {
            return false;
          }
          /* Case-3 */
          if (report.reportName && !report.reportLink) {
            return false;
          }
          /* Case-4 */
          if (report.reportLink && !report.reportName) {
            return false;
          }
          return true;
        }
      },
      {
        message:
          "Invalid medical report data. If shouldDelete is true, reportId must be provided. If reportId is provided, shouldDelete must be true. If reportName is provided, reportLink must also be provided and vice versa.",
      },
    ),
});

export const patientValidation = {
  updatePatientProfileZodSchema,
};
