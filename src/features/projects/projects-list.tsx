"use client";

import { useMemo, useState } from "react";
import { GalleryHorizontalEndIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import {
  usePublishedProjectCategories,
  usePublishedProjects,
} from "@/features/projects/hooks";
import { ProjectCard } from "@/features/projects/project-card";
import { SUGGESTED_PROJECT_CATEGORIES } from "@/lib/constants";

export interface ProjectsListProps {
  pageSize?: number;
}

function uniqueCategoryNames(values: readonly string[]): string[] {
  const names = new Map<string, string>();

  for (const value of values) {
    const name = value.trim();
    if (name) {
      names.set(name.toLocaleLowerCase(), name);
    }
  }

  return Array.from(names.values());
}

export function ProjectsList({ pageSize = 9 }: ProjectsListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoriesQuery = usePublishedProjectCategories();
  const projectsQuery = usePublishedProjects(selectedCategory, pageSize);
  const projects =
    projectsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const categories = useMemo(() => {
    const publishedNames = uniqueCategoryNames(
      categoriesQuery.data?.map((category) => category.name) ?? [],
    );

    return publishedNames.length > 0
      ? publishedNames
      : uniqueCategoryNames(SUGGESTED_PROJECT_CATEGORIES);
  }, [categoriesQuery.data]);

  return (
    <div className="space-y-10">
      <section aria-labelledby="project-filter-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="project-filter-heading" className="font-heading text-xl font-semibold">
              Filter projects
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a published project category.
            </p>
          </div>
          {selectedCategory && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
            >
              Clear filter
            </Button>
          )}
        </div>

        {categoriesQuery.isPending ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading project categories…
          </p>
        ) : (
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Project category"
          >
            <Button
              type="button"
              variant={selectedCategory === null ? "default" : "outline"}
              aria-pressed={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            >
              All projects
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                type="button"
                variant={selectedCategory === category ? "default" : "outline"}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        {categoriesQuery.isError && (
          <p className="text-sm text-muted-foreground" role="status">
            Published categories could not be loaded, so standard project
            categories are shown instead.
          </p>
        )}
      </section>

      <div aria-live="polite" className="sr-only">
        {selectedCategory
          ? `Showing ${selectedCategory} projects`
          : "Showing all projects"}
      </div>

      {projectsQuery.isPending ? (
        <LoadingState
          message="Loading projects"
          description={
            selectedCategory
              ? `Gathering published ${selectedCategory} projects.`
              : "Gathering our published portfolio."
          }
        />
      ) : projectsQuery.isError && projects.length === 0 ? (
        <ErrorState
          title="Projects could not be loaded"
          description={projectsQuery.error.message}
          onRetry={() => void projectsQuery.refetch()}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<GalleryHorizontalEndIcon />}
          title={
            selectedCategory
              ? `No ${selectedCategory} projects found`
              : "Projects are being prepared"
          }
          description={
            selectedCategory
              ? "Try another category or view the complete portfolio."
              : "There are no published projects to show right now. Please check back soon."
          }
          action={
            selectedCategory ? (
              <Button type="button" onClick={() => setSelectedCategory(null)}>
                View all projects
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {projectsQuery.isError && (
            <ErrorState
              className="min-h-36"
              title="The next projects could not be loaded"
              description={projectsQuery.error.message}
              retryLabel="Try loading more again"
              onRetry={() => void projectsQuery.fetchNextPage()}
            />
          )}

          {projectsQuery.hasNextPage && !projectsQuery.isError && (
            <div className="flex flex-col items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={projectsQuery.isFetchingNextPage}
                onClick={() => void projectsQuery.fetchNextPage()}
              >
                {projectsQuery.isFetchingNextPage
                  ? "Loading more projects…"
                  : "Load more projects"}
              </Button>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Showing {projects.length} projects
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
