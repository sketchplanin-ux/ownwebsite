"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavigationItemActive,
  MobileNavigation,
  type NavigationItem,
} from "@/components/website/mobile-navigation";
import {
  DEFAULT_CONTACT_EMAIL,
  DEFAULT_SITE_IDENTITY,
  SiteLogo,
  type SiteLogoSettings,
} from "@/components/website/site-logo";
import { cn } from "@/lib/utils";

export const PUBLIC_NAVIGATION_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const satisfies readonly NavigationItem[];

export interface NavbarSettings extends SiteLogoSettings {
  email?: string;
}

export interface NavbarProps {
  items?: readonly NavigationItem[];
  settings?: NavbarSettings;
}

export function Navbar({
  items = PUBLIC_NAVIGATION_ITEMS,
  settings,
}: NavbarProps) {
  const pathname = usePathname();
  const companyName =
    settings?.companyName?.trim() || DEFAULT_SITE_IDENTITY.companyName;
  const contactEmail = settings?.email?.trim() || DEFAULT_CONTACT_EMAIL;
  const descriptor =
    settings?.descriptor?.trim() || DEFAULT_SITE_IDENTITY.descriptor;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 supports-backdrop-filter:bg-background/80 supports-backdrop-filter:backdrop-blur-xl">
      <div className="hidden border-b border-border/60 md:block">
        <div className="mx-auto flex h-9 max-w-screen-2xl items-center justify-between px-6 lg:px-10 xl:px-14">
          <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {descriptor}
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="rounded-sm text-xs font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {contactEmail}
          </a>
        </div>
      </div>

      <div className="mx-auto grid h-18 max-w-screen-2xl grid-cols-[1fr_auto] items-center px-5 sm:h-20 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:px-10 xl:px-14">
        <SiteLogo settings={settings} priority />

        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center justify-center gap-1 xl:gap-2">
            {items.map((item) => {
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-11 items-center rounded-sm px-3 text-[0.78rem] font-semibold tracking-[0.08em] uppercase outline-none transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:bg-current after:transition-transform focus-visible:ring-2 focus-visible:ring-ring xl:px-4 xl:after:inset-x-4",
                      isActive
                        ? "text-foreground after:scale-x-100"
                        : "text-muted-foreground after:scale-x-0 hover:text-foreground hover:after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <a
          href={`mailto:${contactEmail}`}
          aria-label={`Email ${companyName} at ${contactEmail}`}
          className="hidden h-10 items-center gap-2 rounded-sm border border-border bg-background px-3 text-xs font-semibold tracking-[0.08em] text-foreground uppercase outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex xl:px-4"
        >
          <Mail aria-hidden="true" className="size-3.5" />
          <span className="hidden 2xl:inline">Discuss a project</span>
          <span className="2xl:hidden">Email</span>
        </a>

        <MobileNavigation
          items={items}
          settings={settings}
          contactEmail={contactEmail}
        />
      </div>
    </header>
  );
}
