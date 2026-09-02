import { ArrowUpRightIcon, ImageIcon } from "lucide-react";
import Link from "next/link";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import type { Service } from "@/types/service";

export interface ServiceCardProps {
  className?: string;
  service: Service;
}

function hasUsableImage(source: string): boolean {
  return isSafeHttpUrl(source) || isSafeRelativeUrl(source);
}

export function ServiceCard({ className, service }: ServiceCardProps) {
  const title = service.title.trim() || "SKETCHPLAN service";
  const description = service.shortDescription.trim();
  const imageAlt =
    service.imageAlt?.trim() || `${title} architecture and design service`;
  const href = `${PUBLIC_ROUTES.services}view/?slug=${encodeURIComponent(service.slug)}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block h-full rounded-2xl outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-architectural ring-1 ring-foreground/10">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {hasUsableImage(service.imageUrl) ? (
            <ResponsiveImage
              src={service.imageUrl}
              alt={imageAlt}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              widths={[320, 480, 640, 800, 960]}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon aria-hidden="true" className="size-10" />
              <span className="sr-only">Image unavailable</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
          {description && (
            <p className="mt-3 line-clamp-3 leading-6 text-pretty text-muted-foreground">
              {description}
            </p>
          )}
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
            Explore service
            <ArrowUpRightIcon
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>
      </article>
    </Link>
  );
}
