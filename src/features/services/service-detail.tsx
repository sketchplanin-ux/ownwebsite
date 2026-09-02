import { ArrowLeftIcon, CheckIcon, ImageIcon } from "lucide-react";
import Link from "next/link";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import type { Service } from "@/types/service";

export interface ServiceDetailProps {
  service: Service;
}

function hasUsableImage(source: string): boolean {
  return isSafeHttpUrl(source) || isSafeRelativeUrl(source);
}

export function ServiceDetail({ service }: ServiceDetailProps) {
  const title = service.title.trim() || "Service details";
  const description = service.description.trim();
  const imageAlt =
    service.imageAlt?.trim() || `${title} architecture and design service`;
  const features = (service.features ?? [])
    .map((feature) => feature.trim())
    .filter((feature) => feature.length > 0);

  return (
    <article>
      <header className="border-b bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)] lg:items-center lg:px-10 lg:py-20">
          <div>
            <Button asChild variant="ghost" className="-ml-2">
              <Link href={PUBLIC_ROUTES.services}>
                <ArrowLeftIcon aria-hidden="true" />
                All services
              </Link>
            </Button>
            <p className="mt-8 text-sm font-semibold tracking-[0.22em] text-primary uppercase">
              What we do
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            {service.shortDescription.trim() && (
              <p className="mt-6 max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
                {service.shortDescription.trim()}
              </p>
            )}
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-architectural ring-1 ring-foreground/10">
            {hasUsableImage(service.imageUrl) ? (
              <ResponsiveImage
                src={service.imageUrl}
                alt={imageAlt}
                loading="eager"
                sizes="(min-width: 1024px) 42vw, 100vw"
                widths={[480, 640, 800, 960, 1280]}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <ImageIcon aria-hidden="true" className="size-12" />
                <span className="sr-only">Image unavailable</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-10 lg:py-24">
        <section aria-labelledby="service-overview-heading">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Our approach
          </p>
          <h2
            id="service-overview-heading"
            className="mt-3 font-heading text-3xl font-semibold tracking-tight"
          >
            Service overview
          </h2>
          {description ? (
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-pretty text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : (
            <p className="mt-6 text-muted-foreground">
              Contact SKETCHPLAN to discuss the scope of this service.
            </p>
          )}
        </section>

        <aside className="h-fit rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="font-heading text-2xl font-semibold">What it can include</h2>
          {features.length > 0 ? (
            <ul className="mt-5 space-y-4">
              {features.map((feature, index) => (
                <li key={`${feature}-${index}`} className="flex gap-3 leading-6">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
                    <CheckIcon aria-hidden="true" className="size-3.5" />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 leading-6 text-muted-foreground">
              Every engagement is tailored to the site, brief, and project goals.
            </p>
          )}
          <Button asChild size="lg" className="mt-7 w-full">
            <Link href={PUBLIC_ROUTES.contact}>Discuss your project</Link>
          </Button>
        </aside>
      </div>
    </article>
  );
}
