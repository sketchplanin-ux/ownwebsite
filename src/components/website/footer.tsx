import { Mail, MoveUpRight } from "lucide-react";
import Link from "next/link";

import {
  DEFAULT_CONTACT_EMAIL,
  SiteLogo,
  type SiteLogoSettings,
} from "@/components/website/site-logo";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

const DEFAULT_STUDIO_CONTACTS = [
  "Ar. Biswanath Das",
  "Er. Partha Sarothi Podder",
  "Er. Pablu Saha",
] as const;

export interface FooterSettings extends SiteLogoSettings {
  clientNames?: readonly string[];
  email?: string;
  footerText?: string;
}

export interface FooterProps {
  settings?: FooterSettings;
}

export function Footer({ settings }: FooterProps) {
  const companyName = settings?.companyName?.trim() || "SKETCHPLAN";
  const contactEmail = settings?.email?.trim() || DEFAULT_CONTACT_EMAIL;
  const footerText =
    settings?.footerText?.trim() || "Architecture, Interior & Planning";
  const studioContacts = (
    settings?.clientNames ?? DEFAULT_STUDIO_CONTACTS
  ).filter((name) => name.trim().length > 0);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-screen-2xl px-6 py-16 sm:py-20 lg:px-10 lg:py-24 xl:px-14">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.45fr)_0.7fr_1fr_1.1fr] lg:gap-10 xl:gap-16">
          <div className="max-w-md">
            <SiteLogo settings={settings} tone="inverse" />
            <p className="mt-7 max-w-sm text-sm leading-7 text-primary-foreground/65">
              {footerText}
            </p>
            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-2 rounded-sm border-b border-primary-foreground/40 pb-1 text-sm font-medium outline-none transition-colors hover:border-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              Start a project
              <MoveUpRight
                aria-hidden="true"
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>

          <div>
            <h2 className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary-foreground/50 uppercase">
              Explore
            </h2>
            <ul className="mt-6 space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-sm text-sm text-primary-foreground/70 outline-none transition-colors hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary-foreground/50 uppercase">
              Studio contacts
            </h2>
            {studioContacts.length > 0 ? (
              <ul className="mt-6 space-y-3 text-sm leading-6 text-primary-foreground/70">
                {studioContacts.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div>
            <h2 className="text-[0.65rem] font-semibold tracking-[0.2em] text-primary-foreground/50 uppercase">
              Enquiries
            </h2>
            <address className="mt-6 not-italic">
              <a
                href={`mailto:${contactEmail}`}
                className="group inline-flex max-w-full items-start gap-3 rounded-sm text-sm leading-6 text-primary-foreground/70 outline-none transition-colors hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground"
              >
                <Mail
                  aria-hidden="true"
                  className="mt-1 size-4 shrink-0 text-primary-foreground/50"
                />
                <span className="break-all">{contactEmail}</span>
              </a>
            </address>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-primary-foreground/15 pt-6 text-[0.68rem] tracking-[0.08em] text-primary-foreground/45 uppercase sm:mt-20 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {currentYear} {companyName}. All rights reserved.
          </p>
          <p>Architecture · Interior · Planning</p>
        </div>
      </div>
    </footer>
  );
}
