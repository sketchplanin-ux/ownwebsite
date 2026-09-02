import { z } from "zod";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "CONVERTED",
  "CLOSED",
  "SPAM",
] as const;

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  adminNotes: z
    .string()
    .trim()
    .max(10_000, "Internal notes must be 10,000 characters or fewer."),
});

export type LeadUpdateFormValues = z.infer<typeof leadUpdateSchema>;
