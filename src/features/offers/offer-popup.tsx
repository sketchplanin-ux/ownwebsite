"use client";

import { ArrowUpRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { sanitizeLinkUrl } from "@/lib/url";
import type { Offer } from "@/types/offer";

interface OfferPopupProps {
  offer: Offer | null;
}

function dismissalKey(offerId: string): string {
  return `sketchplan:offer-dismissed:${offerId}`;
}

export function OfferPopup({ offer }: OfferPopupProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!offer) {
        setIsOpen(false);
        return;
      }

      try {
        setIsOpen(sessionStorage.getItem(dismissalKey(offer.id)) !== "true");
      } catch {
        setIsOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [offer]);

  if (!offer || !isOpen) {
    return null;
  }

  const dismiss = () => {
    try {
      sessionStorage.setItem(dismissalKey(offer.id), "true");
    } catch {
      // The in-memory dismissal still keeps the popup closed for this view.
    }
    setIsOpen(false);
  };
  const buttonUrl = offer.buttonUrl
    ? sanitizeLinkUrl(offer.buttonUrl)
    : null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="fixed right-4 bottom-20 z-40 w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl sm:right-6 sm:bottom-24"
    >
      {offer.imageUrl?.trim() ? (
        <ResponsiveImage
          src={offer.imageUrl}
          alt={offer.imageAlt?.trim() || offer.title}
          sizes="(max-width: 440px) calc(100vw - 2rem), 400px"
          widths={[320, 400, 480, 640]}
          className="aspect-[16/8] w-full object-cover"
        />
      ) : null}
      <div className="relative p-5 pr-12">
        <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Current offer
        </p>
        <h2 id={titleId} className="mt-2 text-xl font-semibold">
          {offer.title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-muted-foreground">
          {offer.description}
        </p>
        {buttonUrl && offer.buttonText?.trim() ? (
          <Link
            href={buttonUrl}
            onClick={dismiss}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            {offer.buttonText}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label={`Dismiss ${offer.title} offer`}
          className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </aside>
  );
}
