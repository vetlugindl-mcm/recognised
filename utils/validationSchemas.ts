import { z } from 'zod';

// Helper: Coerce nulls/undefined to empty strings for UI safety where strict strings are expected
const safeString = z.string().nullable().optional().transform(val => val ?? "");
// Helper: Allow nulls for specific nullable fields in our types
const nullableString = z.string().nullable().optional().transform(val => val ?? null);

export const PassportSchema = z.object({
  type: z.literal('passport'),
  lastName: safeString,
  firstName: safeString,
  middleName: safeString,
  seriesNumber: safeString,
  issuedBy: safeString,
  dateIssued: safeString,
  departmentCode: safeString,
  birthDate: safeString,
  birthPlace: safeString,
  registration: safeString,
  snils: nullableString,
});

export const DiplomaSchema = z.object({
  type: z.literal('diploma'),
  lastName: safeString,
  firstName: safeString,
  middleName: safeString,
  series: nullableString,
  number: safeString,
  regNumber: safeString,
  institution: safeString,
  city: safeString,
  specialty: safeString,
  qualification: safeString,
  dateIssued: safeString,
});

export const QualificationSchema = z.object({
  type: z.literal('qualification'),
  lastName: safeString,
  firstName: safeString,
  middleName: safeString,
  registrationNumber: safeString,
  issueDate: safeString,
  expirationDate: safeString,
  assessmentCenterName: safeString,
  assessmentCenterRegNumber: safeString,
});

export const RawDataSchema = z.object({
  type: z.literal('raw'),
  rawText: z.string(),
});

// Union Schema for all document types
export const DocumentSchema = z.discriminatedUnion('type', [
  PassportSchema,
  DiplomaSchema,
  QualificationSchema,
  RawDataSchema
]);

export type ValidatedDocument = z.infer<typeof DocumentSchema>;
