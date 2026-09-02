import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarDaysIcon,
  ImageIcon,
  MapPinIcon,
  ShapesIcon,
} from "lucide-react";
import Link from "next/link";

import { ResponsiveImage } from "@/components/website/responsive-image";
import { Button } from "@/components/ui/button";
import { ProjectGallery } from "@/features/projects/project-gallery";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { isSafeHttpUrl, isSafeRelativeUrl } from "@/lib/url";
import type { Project } from "@/types/project";

export interface ProjectDetailProps {
  project: Project;
}

interface ProjectFact {
  icon: typeof MapPinIcon;
  label: string;
  value: string;
}

function hasUsableImage(source: string): boolean {
  return isSafeHttpUrl(source) || isSafeRelativeUrl(source);
}

function formatCompletionDate(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const title = project.title.trim() || "Project details";
  const description = project.description.trim();
  const imageAlt =
    project.coverImageAlt?.trim() || `${title} completed project`;
  const completionDate = formatCompletionDate(project.completionDate);
  const facts: ProjectFact[] = [
    ...(project.category.trim()
      ? [
          {
            icon: ShapesIcon,
            label: "Category",
            value: project.category.trim(),
          },
        ]
      : []),
    ...(project.projectType?.trim()
      ? [
          {
            icon: Building2Icon,
            label: "Project type",
            value: project.projectType.trim(),
          },
        ]
      : []),
    ...(project.location?.trim()
      ? [
          {
            icon: MapPinIcon,
            label: "Location",
            value: project.location.trim(),
          },
        ]
      : []),
    ...(completionDate
      ? [
          {
            icon: CalendarDaysIcon,
            label: "Completed",
            value: completionDate,
          },
        ]
      : []),
  ];
  const galleryImages = Array.isArray(project.galleryImages)
    ? project.galleryImages
    : [];

  return (
    <article>
      <header className="border-b bg-surface">
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-12 sm:px-8 lg:px-10 lg:pt-14 lg:pb-20">
          <Button asChild variant="ghost" className="-ml-2">
            <Link href={PUBLIC_ROUTES.projects}>
              <ArrowLeftIcon aria-hidden="true" />
              All projects
            </Link>
          </Button>

          <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              {project.category.trim() && (
                <p className="text-sm font-semibold tracking-[0.22em] text-primary uppercase">
                  {project.category.trim()}
                </p>
              )}
              <h1 className="mt-4 max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              {project.shortDescription?.trim() && (
                <p className="mt-6 max-w-3xl text-lg leading-8 text-pretty text-muted-foreground">
                  {project.shortDescription.trim()}
                </p>
              )}
            </div>
            {project.location?.trim() && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPinIcon aria-hidden="true" className="size-4" />
                {project.location.trim()}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10 lg:py-16">
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-muted shadow-architectural ring-1 ring-foreground/10">
          {hasUsableImage(project.coverImageUrl) ? (
            <ResponsiveImage
              src={project.coverImageUrl}
              alt={imageAlt}
              loading="eager"
              sizes="(min-width: 1280px) 1200px, 100vw"
              widths={[640, 800, 1024, 1280, 1600, 1920]}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageIcon aria-hidden="true" className="size-14" />
              <span className="sr-only">Cover image unavailable</span>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:px-10 lg:py-16">
        <section aria-labelledby="project-story-heading">
          <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
            Project story
          </p>
          <h2
            id="project-story-heading"
            className="mt-3 font-heading text-3xl font-semibold tracking-tight"
          >
            Design overview
          </h2>
          {description ? (
            <p className="mt-6 whitespace-pre-line text-base leading-8 text-pretty text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : (
            <p className="mt-6 text-muted-foreground">
              More information about this project will be added soon.
            </p>
          )}
        </section>

        {facts.length > 0 && (
          <aside className="h-fit rounded-2xl bg-card p-6 ring-1 ring-foreground/10">
            <h2 className="font-heading text-2xl font-semibold">Project details</h2>
            <dl className="mt-5 divide-y divide-border">
              {facts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="grid grid-cols-[1.5rem_1fr] gap-x-3 py-4 first:pt-0 last:pb-0">
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 size-4 text-primary"
                    />
                    <div>
                      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 font-medium">{fact.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </aside>
        )}
      </div>

      {galleryImages.length > 0 && (
        <section
          aria-labelledby="project-gallery-heading"
          className="border-t bg-surface"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              Gallery
            </p>
            <h2
              id="project-gallery-heading"
              className="mt-3 font-heading text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              A closer look
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
              Select an image to open the full-screen viewer. Use the arrow keys
              to move through the ordered gallery.
            </p>
            <ProjectGallery
              className="mt-10"
              images={galleryImages}
              projectTitle={title}
            />
          </div>
        </section>
      )}
    </article>
  );
}
