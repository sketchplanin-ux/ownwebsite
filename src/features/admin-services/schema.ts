import { z } from "zod"

import { isSafeHttpUrl } from "@/lib/url"
import type { Service, ServiceInput } from "@/types/service"

const SERVICE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const serviceImageSchema = z.object({
  url: z
    .string()
    .trim()
    .refine((value) => isSafeHttpUrl(value), "Upload a valid image."),
  publicId: z.string().trim().max(300).optional(),
  width: z.number().positive().finite().optional(),
  height: z.number().positive().finite().optional(),
  alt: z.string().max(180),
})

const serviceFeatureSchema = z.object({
  value: z.string().trim().max(160, "Feature must be 160 characters or fewer."),
})

const serviceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Enter a service title.")
    .max(120, "Title must be 120 characters or fewer."),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL slug.")
    .max(160, "Slug must be 160 characters or fewer.")
    .regex(
      SERVICE_SLUG_PATTERN,
      "Use lowercase letters, numbers, and single hyphens only."
    ),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Enter a short description.")
    .max(240, "Short description must be 240 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(20, "Enter the full service description.")
    .max(8_000, "Description must be 8,000 characters or fewer."),
  images: z.array(serviceImageSchema).min(1, "Upload a service image.").max(1),
  imageAlt: z
    .string()
    .trim()
    .min(3, "Describe the service image.")
    .max(180, "Image description must be 180 characters or fewer."),
  icon: z.string().trim().max(80, "Icon name must be 80 characters or fewer."),
  features: z.array(serviceFeatureSchema).max(20),
  featured: z.boolean(),
  published: z.boolean(),
  displayOrder: z
    .number({ error: "Enter a display order." })
    .int("Display order must be a whole number.")
    .min(0, "Display order cannot be negative.")
    .max(10_000, "Display order must be 10,000 or less."),
  metaTitle: z
    .string()
    .trim()
    .max(70, "SEO title should be 70 characters or fewer."),
  metaDescription: z
    .string()
    .trim()
    .max(180, "SEO description should be 180 characters or fewer."),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

function createServiceFormValues(service?: Service | null): ServiceFormValues {
  return {
    title: service?.title ?? "",
    slug: service?.slug ?? "",
    shortDescription: service?.shortDescription ?? "",
    description: service?.description ?? "",
    images: service?.imageUrl
      ? [
          {
            url: service.imageUrl,
            ...(service.imagePublicId
              ? { publicId: service.imagePublicId }
              : {}),
            alt: service.imageAlt,
          },
        ]
      : [],
    imageAlt: service?.imageAlt ?? "",
    icon: service?.icon ?? "",
    features:
      service?.features && service.features.length > 0
        ? service.features.map((value) => ({ value }))
        : [{ value: "" }],
    featured: service?.featured ?? false,
    published: service?.published ?? false,
    displayOrder: service?.displayOrder ?? 0,
    metaTitle: service?.metaTitle ?? "",
    metaDescription: service?.metaDescription ?? "",
  }
}

function toServiceInput(values: ServiceFormValues): ServiceInput {
  const image = values.images[0]
  const features = values.features
    .map((feature) => feature.value.trim())
    .filter((feature) => feature.length > 0)

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    imageUrl: image.url,
    ...(image.publicId ? { imagePublicId: image.publicId } : {}),
    imageAlt: values.imageAlt.trim(),
    ...(values.icon.trim() ? { icon: values.icon.trim() } : {}),
    ...(features.length > 0 ? { features } : {}),
    featured: values.featured,
    published: values.published,
    displayOrder: values.displayOrder,
    ...(values.metaTitle.trim() ? { metaTitle: values.metaTitle.trim() } : {}),
    ...(values.metaDescription.trim()
      ? { metaDescription: values.metaDescription.trim() }
      : {}),
  }
}

export {
  SERVICE_SLUG_PATTERN,
  createServiceFormValues,
  serviceFormSchema,
  serviceImageSchema,
  toServiceInput,
  type ServiceFormValues,
}
