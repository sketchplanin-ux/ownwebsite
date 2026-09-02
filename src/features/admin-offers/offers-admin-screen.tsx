"use client";

import { BadgePercent, Edit3, Plus, Search, Trash2 } from "lucide-react";
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
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { useDebounce } from "@/hooks/use-debounce";
import { ADMIN_ROUTES } from "@/lib/constants";
import { formatDate, toDate } from "@/lib/date";
import type { Offer } from "@/types/offer";

import {
  AdminOffersAccessDenied,
  AdminOffersAccessLoading,
} from "./access-state";
import { ADMIN_OFFER_READ_LIMIT } from "./api";
import { useAdminOffers, useDeleteAdminOffer } from "./hooks";

const PAGE_SIZE = 10;
const EMPTY_OFFERS: readonly Offer[] = [];

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

function scheduleLabel(offer: Offer): string {
  if (offer.startAt && offer.endAt) {
    return `${formatScheduleDate(offer.startAt)} – ${formatScheduleDate(offer.endAt)}`;
  }
  if (offer.startAt) {
    return `From ${formatScheduleDate(offer.startAt)}`;
  }
  if (offer.endAt) {
    return `Until ${formatScheduleDate(offer.endAt)}`;
  }
  return "Always";
}

function visibilityStatus(offer: Offer): string {
  if (!offer.active) {
    return "inactive";
  }
  const now = Date.now();
  const startAt = toDate(offer.startAt)?.getTime();
  const endAt = toDate(offer.endAt)?.getTime();
  if (startAt !== undefined && startAt > now) {
    return "scheduled";
  }
  if (endAt !== undefined && endAt < now) {
    return "expired";
  }
  return "active";
}

function OfferListLoading() {
  return (
    <div role="status" aria-label="Loading offers" className="space-y-4">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-96 rounded-xl" />
      <span className="sr-only">Loading offers…</span>
    </div>
  );
}

export function OffersAdminScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_OFFERS);
  const offersQuery = useAdminOffers(canManage);
  const deleteMutation = useDeleteAdminOffer();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const debouncedSearch = useDebounce(search, 250);
  const offers = offersQuery.data ?? EMPTY_OFFERS;
  const filteredOffers = useMemo(() => {
    const term = normalizeSearchValue(debouncedSearch);
    return offers.filter((offer) => {
      const searchable = [offer.title, offer.description, offer.buttonText]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLocaleLowerCase("en-US");
      const matchesSearch = !term || searchable.includes(term);
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? offer.active : !offer.active);
      return matchesSearch && matchesActive;
    });
  }, [activeFilter, debouncedSearch, offers]);
  const pageCount = Math.max(1, Math.ceil(filteredOffers.length / PAGE_SIZE));
  const visiblePage = Math.min(page, pageCount);
  const visibleOffers = filteredOffers.slice(
    (visiblePage - 1) * PAGE_SIZE,
    visiblePage * PAGE_SIZE,
  );

  if (admin.isLoading) {
    return <AdminOffersAccessLoading />;
  }
  if (!canManage) {
    return <AdminOffersAccessDenied />;
  }

  const resetFilters = () => {
    setSearch("");
    setActiveFilter("all");
    setPage(1);
  };

  const deleteOffer = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Offer deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The offer could not be deleted.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Manage scheduled homepage and popup promotions. The list is bounded to
          the {ADMIN_OFFER_READ_LIMIT} most recently updated records.
        </p>
        <Button asChild>
          <Link href={`${ADMIN_ROUTES.offers}create/`}>
            <Plus aria-hidden="true" />
            Create offer
          </Link>
        </Button>
      </div>

      {offersQuery.isPending ? <OfferListLoading /> : null}
      {offersQuery.isError ? (
        <ErrorState
          title="Offers unavailable"
          description={offersQuery.error.message}
          onRetry={() => void offersQuery.refetch()}
        />
      ) : null}
      {offersQuery.isSuccess ? (
        <>
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(16rem,1fr)_12rem_auto]">
              <label className="relative block">
                <span className="sr-only">Search offers</span>
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
                  placeholder="Search title, description, button…"
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

          {offers.length === 0 ? (
            <EmptyState
              title="No offers yet"
              description="Create the first offer for a homepage or popup promotion."
              icon={<BadgePercent />}
              action={
                <Button asChild>
                  <Link href={`${ADMIN_ROUTES.offers}create/`}>
                    <Plus aria-hidden="true" />
                    Create offer
                  </Link>
                </Button>
              }
            />
          ) : filteredOffers.length === 0 ? (
            <EmptyState
              title="No offers match these filters"
              description="Adjust the search or active status filter to see more offers."
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
                    Showing {visibleOffers.length} of {filteredOffers.length} matching offers.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Offer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Placements</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="min-w-64 whitespace-normal">
                          <p className="font-semibold">{offer.title}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {offer.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={visibilityStatus(offer)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {offer.showOnHomepage ? <Badge variant="outline">Homepage</Badge> : null}
                            {offer.showAsPopup ? <Badge variant="outline">Popup</Badge> : null}
                            {!offer.showOnHomepage && !offer.showAsPopup ? (
                              <span className="text-xs text-muted-foreground">None</span>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-64 whitespace-normal text-xs text-muted-foreground">
                          {scheduleLabel(offer)}
                        </TableCell>
                        <TableCell>{offer.displayOrder}</TableCell>
                        <TableCell>{formatDate(offer.updatedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon-sm">
                              <Link
                                href={`${ADMIN_ROUTES.offers}edit/?id=${encodeURIComponent(offer.id)}`}
                                aria-label={`Edit ${offer.title}`}
                              >
                                <Edit3 aria-hidden="true" />
                              </Link>
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              aria-label={`Delete ${offer.title}`}
                              onClick={() => setDeleteTarget(offer)}
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
            <AlertDialogTitle>Delete offer?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.title}” will be permanently deleted. Cloudinary assets are not automatically removed.`
                : "This offer will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteOffer();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete offer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
