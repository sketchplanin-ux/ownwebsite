"use client";

import {
  Edit3,
  Eye,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationControls } from "@/components/common/pagination-controls";
import { StatusBadge } from "@/components/common/status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/date";
import type { Project, ProjectCategory } from "@/types/project";

import {
  AdminProjectsAccessDenied,
  AdminProjectsAccessLoading,
} from "./access-state";
import { ADMIN_PROJECT_READ_LIMIT } from "./api";
import { ProjectCategoryManager } from "./category-manager";
import {
  useAdminProjectCategories,
  useAdminProjects,
  useDeleteAdminProject,
} from "./hooks";

const PAGE_SIZE = 10;
const EMPTY_PROJECTS: readonly Project[] = [];
const EMPTY_CATEGORIES: readonly ProjectCategory[] = [];

type PublicationFilter = "all" | "published" | "draft";
type FeaturedFilter = "all" | "featured" | "standard";

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function projectMatchesCategory(
  project: Project,
  categoryId: string,
  categories: readonly ProjectCategory[],
): boolean {
  if (!categoryId) {
    return true;
  }
  if (project.categoryId === categoryId) {
    return true;
  }
  const category = categories.find((item) => item.id === categoryId);
  return Boolean(
    category &&
      project.category.trim().toLocaleLowerCase("en-US") ===
        category.name.trim().toLocaleLowerCase("en-US"),
  );
}

function ProjectListLoading() {
  return (
    <div role="status" aria-label="Loading projects" className="space-y-4">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <span className="sr-only">Loading projects…</span>
    </div>
  );
}

export function ProjectsAdminScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_PROJECTS);
  const projectsQuery = useAdminProjects(canManage);
  const categoriesQuery = useAdminProjectCategories(canManage);
  const deleteMutation = useDeleteAdminProject();
  const [search, setSearch] = useState("");
  const [publication, setPublication] = useState<PublicationFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const debouncedSearch = useDebounce(search, 250);
  const projects = projectsQuery.data ?? EMPTY_PROJECTS;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

  const filteredProjects = useMemo(() => {
    const term = normalizeSearchValue(debouncedSearch);
    return projects.filter((project) => {
      const searchable = [
        project.title,
        project.slug,
        project.category,
        project.location,
        project.clientName,
        project.projectType,
      ]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLocaleLowerCase("en-US");
      const matchesSearch = !term || searchable.includes(term);
      const matchesPublication =
        publication === "all" ||
        (publication === "published" ? project.published : !project.published);
      const matchesFeatured =
        featured === "all" ||
        (featured === "featured" ? project.featured : !project.featured);
      return (
        matchesSearch &&
        matchesPublication &&
        matchesFeatured &&
        projectMatchesCategory(project, categoryId, categories)
      );
    });
  }, [categories, categoryId, debouncedSearch, featured, projects, publication]);
  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / PAGE_SIZE));
  const visiblePage = Math.min(page, pageCount);
  const visibleProjects = filteredProjects.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  if (admin.isLoading) {
    return <AdminProjectsAccessLoading />;
  }

  if (!canManage) {
    return <AdminProjectsAccessDenied />;
  }

  const resetFilters = () => {
    setSearch("");
    setPublication("all");
    setFeatured("all");
    setCategoryId("");
    setPage(1);
  };

  const deleteProject = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Project deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The project could not be deleted.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Manage project records, publishing, portfolio media, and project
            categories. The list is bounded to the {ADMIN_PROJECT_READ_LIMIT} most
            recently updated records.
          </p>
        </div>
        <Button asChild>
          <Link href={`${ADMIN_ROUTES.projects}create/`}>
            <Plus aria-hidden="true" />
            Create project
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="projects" className="gap-6">
        <TabsList aria-label="Project administration sections">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-5">
          {projectsQuery.isPending ? <ProjectListLoading /> : null}
          {projectsQuery.isError ? (
            <ErrorState
              title="Projects unavailable"
              description={projectsQuery.error.message}
              onRetry={() => void projectsQuery.refetch()}
            />
          ) : null}
          {projectsQuery.isSuccess ? (
            <>
              <Card>
                <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_14rem_12rem_auto]">
                  <label className="relative block">
                    <span className="sr-only">Search projects</span>
                    <Search
                      aria-hidden="true"
                      className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="search"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search title, slug, location…"
                      className="pl-8"
                    />
                  </label>
                  <label>
                    <span className="sr-only">Publication status</span>
                    <select
                      value={publication}
                      onChange={(event) => {
                        setPublication(event.target.value as PublicationFilter);
                        setPage(1);
                      }}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="all">All statuses</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Project category</span>
                    <select
                      value={categoryId}
                      onChange={(event) => {
                        setCategoryId(event.target.value);
                        setPage(1);
                      }}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="">All categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Featured status</span>
                    <select
                      value={featured}
                      onChange={(event) => {
                        setFeatured(event.target.value as FeaturedFilter);
                        setPage(1);
                      }}
                      className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="all">All placements</option>
                      <option value="featured">Featured</option>
                      <option value="standard">Not featured</option>
                    </select>
                  </label>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </CardContent>
              </Card>

              {projects.length === 0 ? (
                <EmptyState
                  title="No projects yet"
                  description="Create the first project to begin building the portfolio."
                  icon={<FolderKanban />}
                  action={
                    <Button asChild>
                      <Link href={`${ADMIN_ROUTES.projects}create/`}>
                        <Plus aria-hidden="true" />
                        Create project
                      </Link>
                    </Button>
                  }
                />
              ) : filteredProjects.length === 0 ? (
                <EmptyState
                  title="No projects match these filters"
                  description="Adjust the search or filters to see more projects."
                  action={
                    <Button type="button" variant="outline" onClick={resetFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableCaption>
                        Showing {visibleProjects.length} of {filteredProjects.length}{" "}
                        matching projects.
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="min-w-64 whitespace-normal">
                              <p className="font-semibold">{project.title}</p>
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                /{project.slug}
                              </p>
                              {project.location?.trim() ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {project.location}
                                </p>
                              ) : null}
                            </TableCell>
                            <TableCell>{project.category}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1.5">
                                <StatusBadge
                                  status={project.published ? "published" : "draft"}
                                />
                                {project.featured ? (
                                  <Badge variant="outline">Featured</Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell>{project.displayOrder}</TableCell>
                            <TableCell>{formatDate(project.updatedAt)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <Button asChild variant="ghost" size="icon-sm">
                                  <Link
                                    href={`${ADMIN_ROUTES.projects}preview/?id=${encodeURIComponent(project.id)}`}
                                    aria-label={`Preview ${project.title}`}
                                  >
                                    <Eye aria-hidden="true" />
                                  </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon-sm">
                                  <Link
                                    href={`${ADMIN_ROUTES.projects}edit/?id=${encodeURIComponent(project.id)}`}
                                    aria-label={`Edit ${project.title}`}
                                  >
                                    <Edit3 aria-hidden="true" />
                                  </Link>
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  aria-label={`Delete ${project.title}`}
                                  onClick={() => setDeleteTarget(project)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <PaginationControls
                      className="border-t p-4"
                      currentPage={visiblePage}
                      totalPages={pageCount}
                      hasPreviousPage={visiblePage > 1}
                      hasNextPage={visiblePage < pageCount}
                      onPreviousPage={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      onNextPage={() =>
                        setPage((current) => Math.min(pageCount, current + 1))
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="categories">
          <ProjectCategoryManager projects={projects} />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” and its stored project record will be permanently deleted. Cloudinary assets are not automatically removed.`
                : "This project will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteProject();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
