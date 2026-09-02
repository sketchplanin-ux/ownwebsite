"use client";

import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  ExternalLink,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { StatusBadge } from "@/components/common/status-badge";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/constants";
import { formatDate, parseDateOnly } from "@/lib/date";

import {
  AdminProjectsAccessDenied,
  AdminProjectsAccessLoading,
} from "./access-state";
import { useAdminProject } from "./hooks";

export function ProjectPreviewScreen() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id")?.trim() ?? "";
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_PROJECTS);
  const projectQuery = useAdminProject(projectId, canManage && Boolean(projectId));

  if (admin.isLoading) {
    return <AdminProjectsAccessLoading />;
  }
  if (!canManage) {
    return <AdminProjectsAccessDenied />;
  }
  if (!projectId) {
    return (
      <EmptyState
        title="No project selected"
        description="Open a project from the project list to preview it."
        action={
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
      />
    );
  }
  if (projectQuery.isPending) {
    return <LoadingState variant="page" message="Loading project preview…" />;
  }
  if (projectQuery.isError) {
    return (
      <ErrorState
        title="Project preview unavailable"
        description={projectQuery.error.message}
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }
  if (!projectQuery.data) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted or the link may be invalid."
        action={
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back to projects
            </Link>
          </Button>
        }
      />
    );
  }

  const project = projectQuery.data;
  const gallery = [...project.galleryImages].sort(
    (first, second) => first.displayOrder - second.displayOrder,
  );
  const completionDate = project.completionDate
    ? parseDateOnly(project.completionDate)
    : null;

  return (
    <article className="space-y-6">
      <header className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={project.published ? "published" : "draft"} />
            {project.featured ? <Badge variant="outline">Featured</Badge> : null}
            <Badge variant="secondary">{project.category}</Badge>
          </div>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">
            {project.title}
          </h2>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            /{project.slug} · order {project.displayOrder}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          {project.published ? (
            <Button asChild variant="outline">
              <Link
                href={`${PUBLIC_ROUTES.projectDetails}?slug=${encodeURIComponent(project.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink aria-hidden="true" />
                Public view
              </Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link
              href={`${ADMIN_ROUTES.projects}edit/?id=${encodeURIComponent(project.id)}`}
            >
              <Edit3 aria-hidden="true" />
              Edit project
            </Link>
          </Button>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border bg-muted">
        <ResponsiveImage
          src={project.coverImageUrl}
          alt={project.coverImageAlt}
          className="max-h-[42rem] w-full object-cover"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <CardTitle>Project description</CardTitle>
          </CardHeader>
          <CardContent>
            {project.shortDescription?.trim() ? (
              <p className="mb-6 text-lg leading-8 text-muted-foreground">
                {project.shortDescription}
              </p>
            ) : null}
            <p className="whitespace-pre-line text-base leading-8">
              {project.description}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                {project.location?.trim() ? (
                  <div>
                    <dt className="flex items-center gap-2 text-muted-foreground">
                      <MapPin aria-hidden="true" className="size-4" /> Location
                    </dt>
                    <dd className="mt-1 font-medium">{project.location}</dd>
                  </div>
                ) : null}
                {project.projectType?.trim() ? (
                  <div>
                    <dt className="text-muted-foreground">Project type</dt>
                    <dd className="mt-1 font-medium">{project.projectType}</dd>
                  </div>
                ) : null}
                {project.clientName?.trim() ? (
                  <div>
                    <dt className="text-muted-foreground">Client</dt>
                    <dd className="mt-1 font-medium">{project.clientName}</dd>
                  </div>
                ) : null}
                {completionDate ? (
                  <div>
                    <dt className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays aria-hidden="true" className="size-4" />
                      Completion
                    </dt>
                    <dd className="mt-1 font-medium">
                      {formatDate(completionDate)}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="mt-1 font-medium">{formatDate(project.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Meta title</p>
                <p className="mt-1">{project.metaTitle?.trim() || "Not set"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Meta description</p>
                <p className="mt-1 leading-6">
                  {project.metaDescription?.trim() || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section aria-labelledby="project-gallery-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
              Media
            </p>
            <h2 id="project-gallery-heading" className="mt-2 text-2xl font-semibold">
              Project gallery
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {gallery.length} {gallery.length === 1 ? "image" : "images"}
          </p>
        </div>
        {gallery.length === 0 ? (
          <EmptyState
            title="No gallery images"
            description="Add gallery images from the project editor."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {gallery.map((image, index) => (
              <figure
                key={`${image.url}-${index}`}
                className="overflow-hidden rounded-xl border bg-card"
              >
                <ResponsiveImage
                  src={image.url}
                  alt={image.alt}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="p-3 text-xs text-muted-foreground">
                  {image.alt} · position {index + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}
