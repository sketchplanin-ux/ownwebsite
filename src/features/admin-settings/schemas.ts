import { z } from "zod";

const HEX_COLOR_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i;
const SAFE_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isSafeLink(value: string): boolean {
  return (
    (value.startsWith("/") && !value.startsWith("//")) || isHttpUrl(value)
  );
}

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

const optionalText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must be ${maximum} characters or fewer.`);

const optionalHttpUrl = (label: string, maximum = 2_048) =>
  optionalText(label, maximum).refine(
    (value) => value === "" || isHttpUrl(value),
    `${label} must be a complete http:// or https:// URL.`,
  );

const optionalAssetUrl = (label: string) =>
  optionalText(label, 2_048).refine(
    (value) => value === "" || isSafeLink(value),
    `${label} must be a complete web URL or a site path beginning with /.`,
  );

const optionalLink = (label: string) =>
  optionalText(label, 2_048).refine(
    (value) => value === "" || isSafeLink(value),
    `${label} must be a complete web URL or a site path beginning with /.`,
  );

const optionalEmail = z
  .string()
  .trim()
  .max(254, "Email must be 254 characters or fewer.")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Enter a valid email address.",
  );

const seoFields = {
  metaTitle: optionalText("Meta title", 70),
  metaDescription: optionalText("Meta description", 200),
};

const callToActionSchema = z.object({
  heading: requiredText("Call-to-action heading", 120),
  description: requiredText("Call-to-action description", 500),
  buttonText: requiredText("Button text", 60),
  buttonUrl: optionalLink("Button URL").refine(
    (value) => value !== "",
    "Button URL is required.",
  ),
});

const imageFields = {
  imageUrl: optionalAssetUrl("Image URL"),
  imageAlt: optionalText("Image alternative text", 180),
};

export const generalSettingsFormSchema = z
  .object({
    companyName: requiredText("Company name", 120),
    logoUrl: optionalAssetUrl("Logo URL"),
    logoAlt: optionalText("Logo alternative text", 180),
    faviconUrl: optionalAssetUrl("Favicon URL"),
    phone: optionalText("Phone", 40),
    whatsappNumber: optionalText("WhatsApp number", 40),
    email: requiredText("Email", 254).refine(
      (value) => z.email().safeParse(value).success,
      "Enter a valid email address.",
    ),
    address: optionalText("Address", 500),
    googleMapsUrl: optionalHttpUrl("Google Maps URL", 4_096),
    officeHours: optionalText("Office hours", 240),
    footerText: requiredText("Footer text", 240),
    brandAccentColor: optionalText("Brand accent color", 7).refine(
      (value) => value === "" || HEX_COLOR_PATTERN.test(value),
      "Use a 3- or 6-digit hexadecimal color such as #9A6B42.",
    ),
  })
  .superRefine((values, context) => {
    if (values.logoUrl && !values.logoAlt) {
      context.addIssue({
        code: "custom",
        path: ["logoAlt"],
        message: "Add meaningful alternative text for the logo.",
      });
    }
  });

export const socialSettingsFormSchema = z.object({
  facebookUrl: optionalHttpUrl("Facebook URL"),
  instagramUrl: optionalHttpUrl("Instagram URL"),
  linkedInUrl: optionalHttpUrl("LinkedIn URL"),
  youtubeUrl: optionalHttpUrl("YouTube URL"),
  whatsappUrl: optionalHttpUrl("WhatsApp URL"),
});

export const seoSettingsFormSchema = z
  .object({
    defaultMetaTitle: requiredText("Default meta title", 70),
    defaultMetaDescription: requiredText("Default meta description", 200),
    defaultOpenGraphImageUrl: optionalAssetUrl("Open Graph image URL"),
    defaultOpenGraphImageAlt: optionalText(
      "Open Graph image alternative text",
      180,
    ),
    siteUrl: optionalHttpUrl("Site URL"),
    companySchema: z.object({
      name: requiredText("Schema company name", 120),
      legalName: optionalText("Legal name", 160),
      description: optionalText("Schema description", 500),
      email: optionalEmail,
      phone: optionalText("Schema phone", 40),
      address: optionalText("Schema address", 500),
      priceRange: optionalText("Price range", 40),
      areaServed: optionalText("Areas served", 500),
    }),
  })
  .superRefine((values, context) => {
    if (
      values.defaultOpenGraphImageUrl &&
      !values.defaultOpenGraphImageAlt
    ) {
      context.addIssue({
        code: "custom",
        path: ["defaultOpenGraphImageAlt"],
        message: "Add alternative text for the Open Graph image.",
      });
    }
  });

export const pageFeatureSchema = z
  .object({
    id: requiredText("Feature ID", 80).regex(
      SAFE_ID_PATTERN,
      "Feature IDs may contain lowercase letters, numbers, and hyphens.",
    ),
    title: requiredText("Feature title", 120),
    description: requiredText("Feature description", 500),
    icon: optionalText("Feature icon", 80).optional(),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const processStepSchema = z
  .object({
    id: requiredText("Process step ID", 80).regex(
      SAFE_ID_PATTERN,
      "Process step IDs may contain lowercase letters, numbers, and hyphens.",
    ),
    title: requiredText("Process step title", 120),
    description: requiredText("Process step description", 500),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const teamMemberSchema = z
  .object({
    id: requiredText("Team member ID", 80).regex(
      SAFE_ID_PATTERN,
      "Team member IDs may contain lowercase letters, numbers, and hyphens.",
    ),
    name: requiredText("Team member name", 120),
    role: requiredText("Team member role", 120),
    bio: optionalText("Team member biography", 1_000).optional(),
    imageUrl: optionalAssetUrl("Team member image URL"),
    imagePublicId: optionalText("Team member image public ID", 240).optional(),
    imageAlt: optionalText("Team member image alternative text", 180),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const awardSchema = z
  .object({
    id: requiredText("Award ID", 80).regex(
      SAFE_ID_PATTERN,
      "Award IDs may contain lowercase letters, numbers, and hyphens.",
    ),
    title: requiredText("Award title", 160),
    issuer: optionalText("Award issuer", 160).optional(),
    year: optionalText("Award year", 20).optional(),
    description: optionalText("Award description", 1_000).optional(),
    imageUrl: optionalAssetUrl("Award image URL"),
    imagePublicId: optionalText("Award image public ID", 240).optional(),
    imageAlt: optionalText("Award image alternative text", 180),
    displayOrder: z.number().int().min(0).max(10_000),
  })
  .strict();

export const pageFeatureListSchema = z.array(pageFeatureSchema).max(24);
export const processStepListSchema = z.array(processStepSchema).max(24);
export const teamMemberListSchema = z.array(teamMemberSchema).max(50);
export const awardListSchema = z.array(awardSchema).max(50);

function structuredJsonField<T>(
  label: string,
  schema: z.ZodType<T>,
) {
  return z
    .string()
    .trim()
    .min(1, `${label} JSON is required.`)
    .max(50_000, `${label} JSON is too large.`)
    .superRefine((value, context) => {
      try {
        const parsed: unknown = JSON.parse(value);
        const result = schema.safeParse(parsed);

        if (!result.success) {
          context.addIssue({
            code: "custom",
            message: `${label} JSON does not match the required structure: ${result.error.issues[0]?.message ?? "invalid value"}`,
          });
        }
      } catch {
        context.addIssue({
          code: "custom",
          message: `${label} must be valid JSON.`,
        });
      }
    });
}

const pageBaseFields = {
  title: requiredText("Page title", 120),
  published: z.boolean(),
  ...seoFields,
};

export const homePageFormSchema = z
  .object({
    ...pageBaseFields,
    introductionHeading: requiredText("Introduction heading", 160),
    introductionBody: requiredText("Introduction body", 3_000),
    introductionImageUrl: imageFields.imageUrl,
    introductionImageAlt: imageFields.imageAlt,
    whyChooseHeading: requiredText("Why choose heading", 160),
    whyChooseItemsJson: structuredJsonField(
      "Why choose items",
      pageFeatureListSchema,
    ),
    processHeading: requiredText("Process heading", 160),
    processStepsJson: structuredJsonField(
      "Process steps",
      processStepListSchema,
    ),
    contactCallToAction: callToActionSchema,
  })
  .superRefine((values, context) => {
    if (values.introductionImageUrl && !values.introductionImageAlt) {
      context.addIssue({
        code: "custom",
        path: ["introductionImageAlt"],
        message: "Add alternative text for the introduction image.",
      });
    }
  });

export const aboutPageFormSchema = z
  .object({
    ...pageBaseFields,
    introduction: requiredText("Introduction", 4_000),
    heroImageUrl: imageFields.imageUrl,
    heroImageAlt: imageFields.imageAlt,
    mission: requiredText("Mission", 2_000),
    vision: requiredText("Vision", 2_000),
    experience: requiredText("Experience", 2_000),
    teamHeading: requiredText("Team heading", 160),
    teamMembersJson: structuredJsonField(
      "Team members",
      teamMemberListSchema,
    ),
    processHeading: requiredText("Process heading", 160),
    processStepsJson: structuredJsonField(
      "Process steps",
      processStepListSchema,
    ),
    whyChooseHeading: requiredText("Why choose heading", 160),
    whyChooseItemsJson: structuredJsonField(
      "Why choose items",
      pageFeatureListSchema,
    ),
    awardsHeading: requiredText("Awards heading", 160),
    awardsJson: structuredJsonField(
      "Awards and certifications",
      awardListSchema,
    ),
    contactCallToAction: callToActionSchema,
  })
  .superRefine((values, context) => {
    if (values.heroImageUrl && !values.heroImageAlt) {
      context.addIssue({
        code: "custom",
        path: ["heroImageAlt"],
        message: "Add alternative text for the hero image.",
      });
    }
  });

export const contactPageFormSchema = z.object({
  ...pageBaseFields,
  heading: requiredText("Contact heading", 160),
  introduction: requiredText("Contact introduction", 2_000),
  formHeading: requiredText("Form heading", 160),
  mapHeading: requiredText("Map heading", 160),
});

export type GeneralSettingsFormValues = z.infer<
  typeof generalSettingsFormSchema
>;
export type SocialSettingsFormValues = z.infer<
  typeof socialSettingsFormSchema
>;
export type SeoSettingsFormValues = z.infer<typeof seoSettingsFormSchema>;
export type HomePageFormValues = z.infer<typeof homePageFormSchema>;
export type AboutPageFormValues = z.infer<typeof aboutPageFormSchema>;
export type ContactPageFormValues = z.infer<typeof contactPageFormSchema>;

export function parseStructuredJson<T>(
  value: string,
  schema: z.ZodType<T>,
): T {
  const parsed: unknown = JSON.parse(value);
  return schema.parse(parsed);
}
