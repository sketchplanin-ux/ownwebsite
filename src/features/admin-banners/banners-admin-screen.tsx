"use client";

import { Edit3, ImageIcon, Plus, Search, Trash2 } from "lucide-react";
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
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatDate, toDate } from "@/lib/date";
import type { Banner } from "@/types/banner";

import {
  AdminBannersAccessDenied,
  AdminBannersAccessLoading,
} from "./access-state";
import { ADMIN_BANNER_READ_LIMIT } from "./api";
import { useAdminBanners, useDeleteAdminBanner } from "./hooks";

const PAGE_SIZE = 10;
const EMPTY_BANNERS: readonly Banner[] = [];

type ActiveFilter = "all" | "active" | "inactive";

function normalizeSearchValue(value: string): string {
  return value.trim().toLocaleLowerCase("en-US");
}

function formatScheduleDate(value: unknown): string {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scheduleLabel(banner: Banner): string {
  if (banner.startAt && banner.endAt) {
    return `${formatScheduleDate(banner.startAt)} – ${formatScheduleDate(banner.endAt)}`;
  }
  if (banner.startAt) {
    return `From ${formatScheduleDate(banner.startAt)}`;
  }
  if (banner.endAt) {
    return `Until ${formatScheduleDate(banner.endAt)}`;
  }
  return "Always";
}

function visibilityStatus(banner: Banner): string {
  if (!banner.active) {
    return "inactive";
  }
  const now = Date.now();
  const startAt = toDate(banner.startAt)?.getTime();
  const endAt = toDate(banner.endAt)?.getTime();
  if (startAt !== undefined && startAt > now) {
    return "scheduled";
  }
  if (endAt !== undefined && endAt < now) {
    return "expired";
  }
  return "active";
}

function BannerListLoading() {
  return (
    <div role="status" aria-label="Loading banners" className="space-y-4">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <span className="sr-only">Loading banners…</span>
    </div>
  );
}

export function BannersAdminScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BANNERS);
  const bannersQuery = useAdminBanners(canManage);
  const deleteMutation = useDeleteAdminBanner();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const debouncedSearch = useDebounce(search, 250);
  const banners = bannersQuery.data ?? EMPTY_BANNERS;
  const filteredBanners = useMemo(() => {
    const term = normalizeSearchValue(debouncedSearch);
    return banners.filter((banner) => {
      const searchable = [banner.title, banner.subtitle, banner.buttonText]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLocaleLowerCase("en-US");
      const matchesSearch = !term || searchable.includes(term);
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? banner.active : !banner.active);
      return matchesSearch && matchesActive;
    });
  }, [activeFilter, banners, debouncedSearch]);
  const pageCount = Math.max(1, Math.ceil(filteredBanners.length / PAGE_SIZE));
  const visiblePage = Math.min(page, pageCount);
  const visibleBanners = filteredBanners.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  if (admin.isLoading) {
    return <AdminBannersAccessLoading />;
  }
  if (!canManage) {
    return <AdminBannersAccessDenied />;
  }

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("all");
    setPage(1);
  };

  const deleteBanner = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Banner deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The banner could not be deleted.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Manage responsive promotional banners and their schedules. The list is
          bounded to the {ADMIN_BANNER_READ_LIMIT} most recently updated records.
        </p>
        <Button asChild>
          <Link href={`${ADMIN_ROUTES.banners}create/`}>
            <Plus aria-hidden="true" />
            Create banner
          </Link>
        </Button>
      </div>

      {bannersQuery.isPending ? <BannerListLoading /> : null}
      {bannersQuery.isError ? (
        <ErrorState
          title="Banners unavailable"
          description={bannersQuery.error.message}
          onRetry={() => void bannersQuery.refetch()}
        />
      ) : null}
      {bannersQuery.isSuccess ? (
        <>
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(16rem,1fr)_12rem_auto]">
              <label className="relative block">
                <span className="sr-only">Search banners</span>
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
                  placeholder="Search title, subtitle, button…"
                  className="pl-8"
                />
              </label>
              <label>
                <span className="sr-only">Active status</span>
                <select
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value as ActiveFilter);
                    setPage(1);
                  }}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active flag</option>
                  <option value="inactive">Inactive flag</option>
                </select>
              </label>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </CardContent>
          </Card>

          {banners.length === 0 ? (
            <EmptyState
              title="No banners yet"
              description="Create the first banner to add artwork to the public homepage."
              icon={<ImageIcon />}
              action={
                <Button asChild>
                  <Link href={`${ADMIN_ROUTES.banners}create/`}>
                    <Plus aria-hidden="true" />
                    Create banner
                  </Link>
                </Button>
              }
            />
          ) : filteredBanners.length === 0 ? (
            <EmptyState
              title="No banners match these filters"
              description="Adjust the search or active status filter to see more banners."
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
                    Showing {visibleBanners.length} of {filteredBanners.length} matching banners.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Banner</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleBanners.map((banner) => (
                      <TableRow key={banner.id}>
                        <TableCell className="min-w-64 whitespace-normal">
                          <p className="font-semibold">{banner.title}</p>
                          {banner.subtitle?.trim() ? (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {banner.subtitle}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {banner.mobileImageUrl ? "Desktop + mobile artwork" : "Desktop artwork"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={visibilityStatus(banner)} />
                        </TableCell>
                        <TableCell className="max-w-64 whitespace-normal text-xs text-muted-foreground">
                          {scheduleLabel(banner)}
                        </TableCell>
                        <TableCell>{banner.displayOrder}</TableCell>
                        <TableCell>{formatDate(banner.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link
                                href={`${ADMIN_ROUTES.banners}edit/?id=${encodeURIComponent(banner.id)}`}
                                aria-label={`Edit ${banner.title}`}
                              >
                                <Edit3 aria-hidden="true" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              aria-label={`Delete ${banner.title}`}
                              onClick={() => setDeleteTarget(banner)}
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
                  onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
                  onNextPage={() => setPage((current) => Math.min(pageCount, current + 1))}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

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
            <AlertDialogTitle>Delete banner?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be permanently deleted. Cloudinary assets are not automatically removed.`
                : "This banner will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteBanner();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete banner"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
