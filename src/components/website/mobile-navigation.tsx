"use client";

import { Menu, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DEFAULT_SITE_IDENTITY,
  SiteLogo,
  type SiteLogoSettings,
} from "@/components/website/site-logo";
import { cn } from "@/lib/utils";

export interface NavigationItem {
  href: string;
  label: string;
}

export interface MobileNavigationProps {
  contactEmail: string;
  items: readonly NavigationItem[];
  settings?: SiteLogoSettings;
}

function normalizePathname(pathname: string) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "");
}

export function isNavigationItemActive(pathname: string, href: string) {
  const currentPath = normalizePathname(pathname);
  const targetPath = normalizePathname(href);

  if (targetPath === "/") {
    return currentPath === targetPath;
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

export function MobileNavigation({
  contactEmail,
  items,
  settings,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const companyName =
    settings?.companyName?.trim() || DEFAULT_SITE_IDENTITY.companyName;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="lg:hidden"
          aria-label="Open main navigation"
        >
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(92vw,28rem)] gap-0 border-border/70 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/70 px-6 py-7 pr-14 text-left">
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse the {companyName} website.
          </SheetDescription>
          <SiteLogo
            settings={settings}
            onNavigate={() => setIsOpen(false)}
          />
        </SheetHeader>

        <nav
          aria-label="Mobile primary navigation"
          className="flex flex-1 flex-col px-6 py-8"
        >
          <ul className="divide-y divide-border/70">
            {items.map((item, index) => {
              const isActive = isNavigationItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <SheetClose asChild>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group flex min-h-14 items-center gap-4 rounded-sm py-4 text-xl font-medium tracking-tight outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="w-6 text-[0.65rem] font-medium tracking-[0.16em] text-muted-foreground"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <MoveUpRight
                        aria-hidden="true"
                        className={cn(
                          "size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
                          isActive ? "opacity-100" : "opacity-35",
                        )}
                      />
                    </Link>
                  </SheetClose>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border/70 bg-muted/40 px-6 py-6">
          <p className="mb-2 text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Start a conversation
          </p>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-block break-all rounded-sm text-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            {contactEmail}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
