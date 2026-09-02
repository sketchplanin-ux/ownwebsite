import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export const DEFAULT_SITE_IDENTITY = {
  companyName: "SKETCHPLAN",
  descriptor: "Architecture · Interior · Planning",
} as const;

export const DEFAULT_CONTACT_EMAIL = "sketchplan.amc@gmail.com";

export interface SiteLogoSettings {
  companyName?: string;
  descriptor?: string;
  logoAlt?: string;
  logoUrl?: string;
}

export interface SiteLogoProps {
  className?: string;
  onNavigate?: () => void;
  priority?: boolean;
  settings?: SiteLogoSettings;
  showDescriptor?: boolean;
  tone?: "default" | "inverse";
}

function withFallback(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function SiteLogo({
  className,
  onNavigate,
  priority = false,
  settings,
  showDescriptor = true,
  tone = "default",
}: SiteLogoProps) {
  const companyName = withFallback(
    settings?.companyName,
    DEFAULT_SITE_IDENTITY.companyName,
  );
  const descriptor = withFallback(
    settings?.descriptor,
    DEFAULT_SITE_IDENTITY.descriptor,
  );
  const logoUrl = settings?.logoUrl?.trim();
  const logoAlt = withFallback(settings?.logoAlt, `${companyName} logo`);
  const isInverse = tone === "inverse";

  return (
    <Link
      href="/"
      aria-label={`${companyName} home`}
      onClick={onNavigate}
      className={cn(
        "group inline-flex min-w-0 items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4",
        isInverse
          ? "focus-visible:ring-offset-primary"
          : "focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center overflow-hidden",
          isInverse ? "text-primary-foreground" : "text-foreground",
        )}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={logoAlt}
            width={40}
            height={40}
            className="size-full object-contain"
            priority={priority}
          />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 40 40"
            className="size-full"
            fill="none"
          >
            <path d="M1 39V1h38" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 31V10h21" stroke="currentColor" strokeWidth="1.5" />
            <path d="m10 31 21-21v21H10Z" stroke="currentColor" />
          </svg>
        )}
      </span>

      <span className="min-w-0 leading-none">
        <span
          className={cn(
            "block truncate text-[1.05rem] font-semibold tracking-[0.22em] transition-opacity group-hover:opacity-70",
            isInverse ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {companyName}
        </span>
        {showDescriptor ? (
          <span
            className={cn(
              "mt-1.5 block truncate text-[0.58rem] font-medium tracking-[0.16em] uppercase",
              isInverse
                ? "text-primary-foreground/60"
                : "text-muted-foreground",
            )}
          >
            {descriptor}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
