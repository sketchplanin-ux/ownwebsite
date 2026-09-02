import { z } from "zod";

export const DEFAULT_ADMIN_DESTINATION = "/admin/dashboard";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Email must be 254 characters or fewer.")
    .refine(
      (value) => z.email().safeParse(value).success,
      "Enter a valid email address.",
    ),
  password: z
    .string()
    .min(1, "Enter your password.")
    .max(128, "Password must be 128 characters or fewer."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export function sanitizeAdminReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_ADMIN_DESTINATION;
  }

  try {
    const baseUrl = new URL("https://sketchplan.invalid");
    const destination = new URL(value, baseUrl);
    const normalizedPathname = destination.pathname.replace(/\/+$/, "") || "/";

    if (
      destination.origin !== baseUrl.origin ||
      !normalizedPathname.startsWith("/admin/") ||
      normalizedPathname === "/admin/login"
    ) {
      return DEFAULT_ADMIN_DESTINATION;
    }

    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return DEFAULT_ADMIN_DESTINATION;
  }
}

