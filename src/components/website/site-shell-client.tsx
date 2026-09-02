"use client";

import { ExternalLink, Mail, Menu, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

import { Footer } from "@/components/website/footer";
import { isNavigationItemActive } from "@/components/website/mobile-navigation";
import { PUBLIC_NAVIGATION_ITEMS } from "@/components/website/navbar";
import { ScrollToTop } from "@/components/website/scroll-to-top";
import { WhatsAppButton } from "@/components/website/whatsapp-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DEFAULT_GENERAL_SETTINGS } from "@/features/settings/defaults";
import {
  useGeneralSettings,
  useSocialSettings,
} from "@/features/settings/hooks";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";

interface SiteShellClientProps {
  children: ReactNode;
}

interface BrandStyle extends CSSProperties {
  "--brand-accent"?: string;
  "--brand-accent-foreground"?: string;
}

interface RailSettings {
  companyName: string;
  descriptor: string;
  email: string;
  phone: string;
  logoAlt: string;
  logoUrl: string;
}

const HEX_COLOR_PATTERN = /^#([\da-f]{3}|[\da-f]{6})$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_BRAND_MARK = "/brand/sketchplan-mark.png";
const INDIA_DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const INDIA_TIME_FORMAT = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function normalizeImageUrl(value: string | undefined): string | undefined {
  const url = value?.trim();
  return url &&
    (isSafeHttpUrl(url) ||
      (isSafeRelativeUrl(url) && url.startsWith("/") && !url.startsWith("//")))
    ? url
    : undefined;
}

function normalizeEmail(value: string | undefined): string {
  const email = value?.trim();
  return email && EMAIL_PATTERN.test(email)
    ? email
    : DEFAULT_GENERAL_SETTINGS.email;
}

function resolveBrandStyle(value: string | undefined): BrandStyle | undefined {
  const color = value?.trim();
  if (!color || !HEX_COLOR_PATTERN.test(color)) {
    return undefined;
  }

  const raw = color.slice(1);
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : raw;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 255_000;

  return {
    "--brand-accent": color,
    "--brand-accent-foreground":
      luminance > 0.58 ? "#211f1b" : "#fffdf8",
  };
}

function IndiaClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(new Date());
    const frame = window.requestAnimationFrame(updateClock);
    const interval = window.setInterval(updateClock, 1_000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-w-0 text-right font-mono text-[0.62rem] leading-4 tracking-[0.13em] uppercase sm:text-[0.68rem]">
      {now ? (
        <time dateTime={now.toISOString()} aria-label="Current date and time in India">
          <span className="hidden text-muted-foreground sm:inline">
            {INDIA_DATE_FORMAT.format(now)} ·{" "}
          </span>
          <span className="font-semibold text-foreground">
            {INDIA_TIME_FORMAT.format(now)} IST
          </span>
        </time>
      ) : (
        <span aria-label="India Standard Time clock loading" className="text-muted-foreground">
          IND · IST / syncing
        </span>
      )}
    </div>
  );
}

function RailBrand({ settings, compact = false }: { settings: RailSettings; compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${settings.companyName} home`}
      className={cn(
        "group inline-flex min-w-0 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary",
        compact ? "gap-2" : "flex-col items-start gap-5",
      )}
    >
      <span
        className={cn(
          "relative shrink-0 overflow-hidden",
          compact ? "h-10 w-8" : "h-24 w-20",
        )}
      >
        <Image
          src={settings.logoUrl}
          alt={settings.logoAlt}
          fill
          sizes={compact ? "32px" : "80px"}
          priority
          className="object-contain object-left"
        />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-sans font-black tracking-[0.19em] uppercase",
            compact
              ? "max-w-[10rem] text-sm text-foreground"
              : "max-w-[12rem] text-xl text-background",
          )}
        >
          {settings.companyName}
        </span>
        {!compact ? (
          <span className="mt-2 block max-w-[11rem] text-[0.57rem] leading-4 font-semibold tracking-[0.18em] text-background/45 uppercase">
            {settings.descriptor}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function RailNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation">
      <ol className="space-y-1">
        {PUBLIC_NAVIGATION_ITEMS.map((item, index) => {
          const active = isNavigationItemActive(pathname, item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group grid min-h-12 grid-cols-[2rem_1fr_auto] items-center gap-2 rounded-sm px-3 font-sans outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-background/65 hover:bg-background/8 hover:text-background",
                )}
              >
                <span className="font-mono text-[0.58rem] tracking-widest opacity-55">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-bold tracking-[0.12em] uppercase">
                  {item.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px bg-current transition-[width]",
                    active ? "w-5" : "w-0 group-hover:w-5",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function DesktopRail({ settings }: { settings: RailSettings }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 overflow-hidden bg-foreground text-background lg:flex lg:flex-col">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="relative flex h-full flex-col px-7 py-8 xl:px-8">
        <div className="flex items-start justify-between gap-4">
          <RailBrand settings={settings} />
          <span className="font-mono text-[0.52rem] tracking-[0.18em] text-background/30 [writing-mode:vertical-rl]">
            SP / PUBLIC / 01
          </span>
        </div>
        <div className="my-9 h-px bg-background/15" />
        <RailNavigation />
        <div className="mt-auto border-t border-background/15 pt-6">
          <p className="font-mono text-[0.55rem] tracking-[0.18em] text-background/35 uppercase">
            Studio information
          </p>
          <a
            href={`mailto:${settings.email}`}
            className="mt-4 flex items-start gap-2 rounded-sm text-xs leading-5 text-background/65 outline-none transition-colors hover:text-background focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Mail aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span className="break-all">{settings.email}</span>
          </a>
          {settings.phone.trim() ? (
            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-background/65">
              <Phone aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>{settings.phone}</span>
            </p>
          ) : null}
          <p className="mt-6 font-mono text-[0.55rem] tracking-[0.15em] text-background/30 uppercase">
            India · Asia/Kolkata
          </p>
        </div>
      </div>
    </aside>
  );
}

function MobileRail({ settings }: { settings: RailSettings }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open site navigation"
          className="inline-flex size-11 items-center justify-center rounded-sm border border-border bg-background text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[min(22rem,88vw)] gap-0 border-background/15 bg-foreground p-0 text-background sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-background/15 p-6 pr-14 text-left">
          <SheetTitle className="text-background">SKETCHPLAN navigation</SheetTitle>
          <SheetDescription className="text-background/50">
            Architecture · Interior · Planning
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          <RailBrand settings={settings} />
          <div className="my-8 h-px bg-background/15" />
          <RailNavigation onNavigate={() => setOpen(false)} />
          <a
            href={`mailto:${settings.email}`}
            className="mt-auto flex items-center gap-2 rounded-sm border-t border-background/15 pt-6 text-xs text-background/65 outline-none hover:text-background focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Mail aria-hidden="true" className="size-3.5" />
            <span className="break-all">{settings.email}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UtilityBar({ settings }: { settings: RailSettings }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/94 supports-backdrop-filter:backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:min-h-18 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <MobileRail settings={settings} />
          <div className="lg:hidden">
            <RailBrand settings={settings} compact />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="font-mono text-[0.57rem] tracking-[0.17em] text-muted-foreground uppercase">
              SKETCHPLAN / Public studio
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold tracking-[0.13em] uppercase">
              {settings.descriptor}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <span className="hidden h-7 w-px bg-border sm:block" />
          <IndiaClock />
        </div>
      </div>
    </header>
  );
}

function ConfiguredSocialLinks() {
  const { data: socialSettings } = useSocialSettings();
  const candidates = [
    { label: "Facebook", url: socialSettings?.facebookUrl },
    { label: "Instagram", url: socialSettings?.instagramUrl },
    { label: "LinkedIn", url: socialSettings?.linkedInUrl },
    { label: "YouTube", url: socialSettings?.youtubeUrl },
    { label: "WhatsApp", url: socialSettings?.whatsappUrl },
  ].flatMap((item) => {
    const url = item.url?.trim();
    return url && isSafeHttpUrl(url) ? [{ ...item, url }] : [];
  });

  if (candidates.length === 0) {
    return null;
  }

  return (
    <aside className="border-t border-border bg-surface px-6 py-5 lg:px-10">
      <nav
        aria-label="SKETCHPLAN on social media"
        className="mx-auto flex max-w-screen-2xl flex-wrap items-center justify-center gap-2 sm:justify-end"
      >
        {candidates.map((item) => (
          <a
            key={item.label}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.label}
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ))}
      </nav>
    </aside>
  );
}

export function SiteShellClient({ children }: SiteShellClientProps) {
  const { data: generalSettings } = useGeneralSettings();
  const settings = generalSettings ?? DEFAULT_GENERAL_SETTINGS;
  const configuredLogoUrl = normalizeImageUrl(settings.logoUrl);
  const companyName =
    settings.companyName?.trim() || DEFAULT_GENERAL_SETTINGS.companyName;
  const railSettings: RailSettings = {
    companyName,
    descriptor: settings.footerText?.trim() || DEFAULT_GENERAL_SETTINGS.footerText,
    email: normalizeEmail(settings.email),
    phone: settings.phone?.trim() || "",
    logoAlt: settings.logoAlt?.trim() || `${companyName} brand mark`,
    logoUrl: configuredLogoUrl ?? DEFAULT_BRAND_MARK,
  };
  const footerSettings = {
    companyName: railSettings.companyName,
    descriptor: railSettings.descriptor,
    email: railSettings.email,
    footerText: railSettings.descriptor,
    logoAlt: settings.logoAlt?.trim() || `${companyName} logo`,
    logoUrl: configuredLogoUrl ?? DEFAULT_BRAND_MARK,
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={resolveBrandStyle(settings.brandAccentColor)}
    >
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg outline-none transition-transform focus-visible:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background lg:left-[19rem]"
      >
        Skip to main content
      </a>
      <DesktopRail settings={railSettings} />
      <div className="flex min-h-screen flex-col lg:ml-72">
        <UtilityBar settings={railSettings} />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 flex-col outline-none"
        >
          {children}
        </main>
        <ConfiguredSocialLinks />
        <Footer settings={footerSettings} />
      </div>
      <WhatsAppButton phoneNumber={settings.whatsappNumber} />
      <ScrollToTop />
    </div>
  );
}
