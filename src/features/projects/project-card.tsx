import { ArrowUpRightIcon, ImageIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

export interface ProjectCardProps {
  className?: string;
  project: Project;
}

function hasUsableImage(source: string): boolean {
  return isSafeHttpUrl(source) || isSafeRelativeUrl(source);
}

export function ProjectCard({ className, project }: ProjectCardProps) {
  const title = project.title.trim() || "SKETCHPLAN project";
  const category = project.category.trim();
  const location = project.location?.trim();
  const imageAlt =
    project.coverImageAlt?.trim() || `${title} completed project`;
  const href = `${PUBLIC_ROUTES.projectDetails}?slug=${encodeURIComponent(project.slug)}`;

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
          {hasUsableImage(project.coverImageUrl) ? (
            <ResponsiveImage
              src={project.coverImageUrl}
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
          {category && (
            <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold tracking-wide text-foreground uppercase shadow-sm backdrop-blur-sm">
              {category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            {title}
          </h2>
          {location && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPinIcon aria-hidden="true" className="size-4 shrink-0" />
              <span>{location}</span>
            </p>
          )}
          {project.shortDescription?.trim() && (
            <p className="mt-3 line-clamp-2 leading-6 text-pretty text-muted-foreground">
              {project.shortDescription.trim()}
            </p>
          )}
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
            View project
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
