"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { sanitizeLinkUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import type { Banner } from "@/types/banner";

interface BannerCarouselProps {
  banners: readonly Banner[];
}

function BannerSlide({ banner }: { banner: Banner }) {
  const buttonUrl = banner.buttonUrl
    ? sanitizeLinkUrl(banner.buttonUrl)
    : null;
  const mobileImageUrl = banner.mobileImageUrl
    ? sanitizeLinkUrl(banner.mobileImageUrl)
    : null;
  const title = banner.title.trim() || "SKETCHPLAN";

  return (
    <article className="relative isolate min-h-[34rem] overflow-hidden bg-foreground text-background sm:min-h-[39rem] lg:min-h-[43rem]">
      <div className="absolute inset-0 bg-foreground">
        <picture>
          {mobileImageUrl ? (
            <source media="(max-width: 639px)" srcSet={mobileImageUrl} />
          ) : null}
          <ResponsiveImage
            src={banner.desktopImageUrl}
            alt={banner.desktopImageAlt?.trim() || title}
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            widths={[640, 960, 1280, 1600, 1920]}
            className="size-full min-h-[34rem] object-cover sm:min-h-[39rem] lg:min-h-[43rem]"
          />
        </picture>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="relative mx-auto flex min-h-[34rem] max-w-screen-2xl items-end px-6 pt-24 pb-20 sm:min-h-[39rem] sm:px-10 sm:pb-24 lg:min-h-[43rem] lg:px-14 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold tracking-[0.26em] text-white/70 uppercase">
            Architecture · Interior · Planning
          </p>
          <h1 className="text-5xl leading-[0.98] font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {banner.subtitle?.trim() ? (
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
              {banner.subtitle}
            </p>
          ) : null}
          {buttonUrl && banner.buttonText?.trim() ? (
            <Link
              href={buttonUrl}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-white"
            >
              {banner.buttonText}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = banners.length > 1;

  if (banners.length === 0) {
    return null;
  }

  const visibleIndex = activeIndex % banners.length;
  const activeBanner = banners[visibleIndex] ?? banners[0];

  return (
    <section
      aria-label="Featured SKETCHPLAN work and announcements"
      aria-roledescription={hasMultiple ? "carousel" : undefined}
      className="relative"
    >
      <BannerSlide banner={activeBanner} />
      {hasMultiple ? (
        <div className="absolute right-6 bottom-6 z-10 flex items-center gap-2 sm:right-10 sm:bottom-10 lg:right-14">
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            Slide {visibleIndex + 1} of {banners.length}: {activeBanner.title}
          </p>
          <button
            type="button"
            aria-label="Show previous banner"
            onClick={() =>
              setActiveIndex((current) =>
                current % banners.length === 0
                  ? banners.length - 1
                  : (current % banners.length) - 1,
              )
            }
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white outline-none backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <div className="flex items-center gap-1.5" aria-label="Choose banner">
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Show banner ${index + 1}: ${banner.title}`}
                aria-current={index === visibleIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-2 rounded-full bg-white/45 outline-none transition-all focus-visible:ring-2 focus-visible:ring-white",
                  index === visibleIndex
                    ? "w-7 bg-white"
                    : "w-2 hover:bg-white/75",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Show next banner"
            onClick={() =>
              setActiveIndex((current) =>
                ((current % banners.length) + 1) % banners.length,
              )
            }
            className="inline-flex size-11 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white outline-none backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
