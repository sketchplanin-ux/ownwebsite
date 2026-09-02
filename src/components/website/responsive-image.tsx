import * as React from "react"

import { mediaHostname } from "@/lib/env"
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

const DEFAULT_RESPONSIVE_WIDTHS = [320, 480, 640, 768, 960, 1280, 1600, 1920]
const TRANSFORMATION_PREFIX = "/cdn-cgi/image/"
const DEFAULT_QUALITY = 85

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

/**
 * Rewrites an R2 object URL into a Cloudflare Image Transformations URL.
 * Only images served from the configured media hostname are rewritten, because
 * the transformation pipeline is bound to that zone.
 */
function buildTransformedImageUrl(
  source: string,
  width: number,
  quality: "auto" | number = "auto"
): string | null {
  const safeWidth = Math.round(width)
  const safeQuality =
    quality === "auto" || !Number.isFinite(quality)
      ? DEFAULT_QUALITY
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
      url.hostname.toLowerCase() !== mediaHostname ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null
    }

    // Already-transformed URLs must not be nested inside another transformation.
    if (url.pathname.startsWith(TRANSFORMATION_PREFIX)) {
      return null
    }

    const objectPath = url.pathname.replace(/^\/+/, "")
    if (!objectPath) {
      return null
    }

    const options = `format=auto,quality=${safeQuality},fit=scale-down,width=${safeWidth}`
    url.pathname = `${TRANSFORMATION_PREFIX}${options}/${objectPath}`

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
      const url = buildTransformedImageUrl(source, candidateWidth, quality)
      return url ? `${url} ${candidateWidth}w` : null
    })
    .filter((candidate): candidate is string => candidate !== null)

  return (
    // Cloudflare Image Transformations perform the resizing for this native
    // responsive image, so next/image is not involved.
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
  buildTransformedImageUrl,
  type ResponsiveImageProps,
}
