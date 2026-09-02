import { z } from "zod"

const PHONE_PATTERN = /^[+\d\s().-]+$/

const optionalEmailSchema = z
  .string()
  .trim()
  .max(254, "Email must be 254 characters or fewer.")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address."
  )

const leadSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(25, "Phone number must be 25 characters or fewer.")
    .regex(PHONE_PATTERN, "Enter a valid phone number."),
  email: optionalEmailSchema,
  service: z
    .string()
    .trim()
    .max(120, "Service must be 120 characters or fewer."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more about your project.")
    .max(2_000, "Message must be 2,000 characters or fewer."),
})

const leadFormSchema = leadSubmissionSchema.extend({
  consent: z.boolean().refine((value) => value, {
    message: "Please agree to be contacted about your enquiry.",
  }),
  website: z.string().max(200),
})

type LeadSubmissionValues = z.infer<typeof leadSubmissionSchema>
type ContactFormValues = z.infer<typeof leadFormSchema>

export {
  leadFormSchema,
  leadSubmissionSchema,
  type ContactFormValues,
  type LeadSubmissionValues,
}
