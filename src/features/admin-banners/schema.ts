import { z } from "zod";

import { isSafeLinkUrl } from "@/lib/url";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function isSecureHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

function validLocalDateTime(value: string): boolean {
  return value === "" || Number.isFinite(new Date(value).getTime());
}

const requiredText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .max(maximum, `${label} must be ${maximum} characters or fewer.`)
    .refine(
      (value) => !CONTROL_CHARACTER_PATTERN.test(value),
      `${label} contains unsupported characters.`,
    );

const optionalText = (label: string, maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must be ${maximum} characters or fewer.`)
    .refine(
      (value) => !CONTROL_CHARACTER_PATTERN.test(value),
      `${label} contains unsupported characters.`,
    );

const optionalImageUrl = z
  .string()
  .trim()
  .max(2_048, "Image URL is too long.")
  .refine(
    (value) => value === "" || isSecureHttpUrl(value),
    "Enter a valid HTTPS image URL.",
  );

export const bannerFormSchema = z
  .object({
    title: requiredText("Title", 140),
    subtitle: optionalText("Subtitle", 400),
    desktopImageUrl: optionalImageUrl.refine(
      (value) => value !== "",
      "A desktop banner image is required.",
    ),
    desktopImagePublicId: optionalText("Desktop image public ID", 300),
    desktopImageAlt: requiredText("Desktop image alt text", 180),
    mobileImageUrl: optionalImageUrl,
    mobileImagePublicId: optionalText("Mobile image public ID", 300),
    mobileImageAlt: optionalText("Mobile image alt text", 180),
    buttonText: optionalText("Button text", 80),
    buttonUrl: z
      .string()
      .trim()
      .max(2_048, "Button URL is too long.")
      .refine(
        (value) => value === "" || isSafeLinkUrl(value),
        "Use a safe site-relative or HTTP(S) URL.",
      ),
    startAt: z
      .string()
      .trim()
      .refine(validLocalDateTime, "Enter a valid start date and time."),
    endAt: z
      .string()
      .trim()
      .refine(validLocalDateTime, "Enter a valid end date and time."),
    active: z.boolean(),
    displayOrder: z
      .number()
      .int("Display order must be a whole number.")
      .min(0, "Display order cannot be negative.")
      .max(9_999, "Display order must be 9999 or less."),
  })
  .superRefine((value, context) => {
    if (value.mobileImageUrl && !value.mobileImageAlt) {
      context.addIssue({
        code: "custom",
        path: ["mobileImageAlt"],
        message: "Mobile image alt text is required when an image is set.",
      });
    }
    if (Boolean(value.buttonText) !== Boolean(value.buttonUrl)) {
      context.addIssue({
        code: "custom",
        path: [value.buttonText ? "buttonUrl" : "buttonText"],
        message: "Button text and URL must be provided together.",
      });
    }
    if (
      value.startAt &&
      value.endAt &&
      new Date(value.endAt).getTime() < new Date(value.startAt).getTime()
    ) {
      context.addIssue({
        code: "custom",
        path: ["endAt"],
        message: "End date and time must be after the start.",
      });
    }
  });

export type BannerFormValues = z.infer<typeof bannerFormSchema>;

export const EMPTY_BANNER_FORM: Readonly<BannerFormValues> = Object.freeze({
  title: "",
  subtitle: "",
  desktopImageUrl: "",
  desktopImagePublicId: "",
  desktopImageAlt: "",
  mobileImageUrl: "",
  mobileImagePublicId: "",
  mobileImageAlt: "",
  buttonText: "",
  buttonUrl: "",
  startAt: "",
  endAt: "",
  active: false,
  displayOrder: 0,
});
