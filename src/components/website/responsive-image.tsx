import * as React from "react"

import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

const DEFAULT_RESPONSIVE_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600, 1920]
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/"

type ResponsiveImageProps = Omit<
  React.ComponentProps<"img">,
  "alt" | "src" | "srcSet"
> & {
  alt: string
  quality?: "auto" | number
  src?: string | null
  widths?: readonly number[]
}

function normalizeWidths(widths: readonly number[]): number[] {
  return Array.from(
    new Set(
      widths
        .filter((width) => Number.isFinite(width))
        .map((width) => Math.round(width))
        .filter((width) => width >= 16 && width <= 3840)
    )
  ).sort((first, second) => first - second)
}

function buildCloudinaryImageUrl(
  source: string,
  width: number,
  quality: "auto" | number = "auto"
): string | null {
  const safeWidth = Math.round(width)
  const safeQuality =
    quality === "auto" || !Number.isFinite(quality)
      ? "auto"
      : Math.min(100, Math.max(1, Math.round(quality)))

  if (
    !isSafeHttpUrl(source) ||
    !Number.isFinite(safeWidth) ||
    safeWidth < 16 ||
    safeWidth > 3840
  ) {
    return null
  }

  try {
    const url = new URL(source)

    if (
      url.protocol !== "https:" ||
      url.hostname.toLowerCase() !== "res.cloudinary.com" ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null
    }

    const markerIndex = url.pathname.indexOf(CLOUDINARY_UPLOAD_MARKER)
    if (markerIndex < 0) {
      return null
    }

    const prefix = url.pathname.slice(
      0,
      markerIndex + CLOUDINARY_UPLOAD_MARKER.length
    )
    const assetPath = url.pathname.slice(
      markerIndex + CLOUDINARY_UPLOAD_MARKER.length
    )

    if (!assetPath || assetPath.startsWith("s--")) {
      return null
    }

    const transformation = `f_auto,q_${safeQuality},c_limit,w_${safeWidth}`
    const segments = assetPath.split("/")
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment))
    const insertionIndex = versionIndex >= 0 ? versionIndex : 0
    segments.splice(insertionIndex, 0, transformation)
    url.pathname = `${prefix}${segments.join("/")}`

    return url.toString()
  } catch {
    return null
  }
}

function ResponsiveImage({
  alt,
  className,
  decoding = "async",
  loading = "lazy",
  quality = "auto",
  sizes = "100vw",
  src,
  widths = DEFAULT_RESPONSIVE_WIDTHS,
  ...props
}: ResponsiveImageProps) {
  const source = src?.trim() ?? ""

  if (
    !source ||
    typeof alt !== "string" ||
    (!isSafeHttpUrl(source) && !isSafeRelativeUrl(source))
  ) {
    return null
  }

  const responsiveWidths = normalizeWidths(widths)
  const candidates = responsiveWidths
    .map((candidateWidth) => {
      const url = buildCloudinaryImageUrl(source, candidateWidth, quality)
      return url ? `${url} ${candidateWidth}w` : null
    })
    .filter((candidate): candidate is string => candidate !== null)

  return (
    // Cloudinary performs the transformations used by this native responsive image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="responsive-image"
      src={source}
      srcSet={candidates.length > 0 ? candidates.join(", ") : undefined}
      sizes={candidates.length > 0 ? sizes : undefined}
      alt={alt}
      loading={loading}
      decoding={decoding}
      className={cn("h-auto max-w-full", className)}
      {...props}
    />
  )
}

export {
  ResponsiveImage,
  buildCloudinaryImageUrl,
  type ResponsiveImageProps,
}
