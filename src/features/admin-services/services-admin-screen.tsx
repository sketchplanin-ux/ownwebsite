"use client"

import * as React from "react"
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { EmptyState } from "@/components/common/empty-state"
import { ErrorState } from "@/components/common/error-state"
import { LoadingState } from "@/components/common/loading-state"
import { PaginationControls } from "@/components/common/pagination-controls"
import { StatusBadge } from "@/components/common/status-badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ResponsiveImage } from "@/components/website/responsive-image"
import {
  useAdminServicesPage,
  useDeleteAdminService,
} from "@/features/admin-services/hooks"
import type {
  AdminServiceCursor,
  AdminServiceStatusFilter,
} from "@/features/admin-services/repository"
import { formatDate } from "@/lib/date"
import type { Service } from "@/types/service"

const PAGE_SIZE = 12

function serviceMatchesSearch(service: Service, search: string) {
  const searchableText = [
    service.title,
    service.slug,
    service.shortDescription,
  ]
    .join(" ")
    .toLocaleLowerCase("en-IN")
  return searchableText.includes(search)
}

function ServicesAdminScreen() {
  const [search, setSearch] = React.useState("")
  const [status, setStatus] =
    React.useState<AdminServiceStatusFilter>("all")
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageCursors, setPageCursors] = React.useState<
    readonly (AdminServiceCursor | null)[]
  >([null])
  const [serviceToDelete, setServiceToDelete] =
    React.useState<Service | null>(null)
  const servicesQuery = useAdminServicesPage({
    status,
    page: pageIndex + 1,
    pageSize: PAGE_SIZE,
    cursor: pageCursors[pageIndex] ?? null,
  })
  const deleteMutation = useDeleteAdminService()
  const normalizedSearch = search.trim().toLocaleLowerCase("en-IN")
  const services = servicesQuery.data?.items ?? []
  const visibleServices = normalizedSearch
    ? services.filter((service) =>
        serviceMatchesSearch(service, normalizedSearch)
      )
    : services

  const changeStatus = (nextStatus: AdminServiceStatusFilter) => {
    setStatus(nextStatus)
    setPageIndex(0)
    setPageCursors([null])
  }

  const goToNextPage = () => {
    const nextCursor = servicesQuery.data?.nextCursor
    if (!nextCursor) {
      return
    }

    setPageCursors((currentCursors) => {
      const nextCursors = currentCursors.slice(0, pageIndex + 1)
      nextCursors[pageIndex + 1] = nextCursor
      return nextCursors
    })
    setPageIndex((currentPage) => currentPage + 1)
  }

  const goToPreviousPage = () => {
    setPageIndex((currentPage) => Math.max(0, currentPage - 1))
  }

  const confirmDelete = async () => {
    if (!serviceToDelete || deleteMutation.isPending) {
      return
    }

    try {
      await deleteMutation.mutateAsync(serviceToDelete.id)
      toast.success("Service deleted. Its Cloudinary image was left unchanged.")
      setServiceToDelete(null)
      if (services.length === 1 && pageIndex > 0) {
        setPageIndex((currentPage) => currentPage - 1)
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "The service could not be deleted. Please try again."
      )
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Content / Services
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Manage services</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Maintain public service content, publishing state, homepage features, and editorial order.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/services/new/">
            <PlusIcon aria-hidden="true" />
            New service
          </Link>
        </Button>
      </header>

      <section aria-label="Service filters" className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div className="relative">
          <label htmlFor="admin-service-search" className="sr-only">
            Search services on this page
          </label>
          <SearchIcon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="admin-service-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search this page by title, slug, or summary"
            className="h-10 pl-10"
          />
        </div>
        <div>
          <label htmlFor="admin-service-status" className="sr-only">
            Filter by publishing status
          </label>
          <select
            id="admin-service-status"
            value={status}
            onChange={(event) =>
              changeStatus(event.target.value as AdminServiceStatusFilter)
            }
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </section>

      {servicesQuery.isPending && (
        <LoadingState message="Loading services…" />
      )}

      {servicesQuery.isError && (
        <ErrorState
          title="Services could not be loaded"
          description={servicesQuery.error.message}
          onRetry={() => void servicesQuery.refetch()}
        />
      )}

      {!servicesQuery.isPending && !servicesQuery.isError && services.length === 0 && (
        <EmptyState
          title={pageIndex > 0 ? "No services on this page" : "No services yet"}
          description={
            pageIndex > 0
              ? "Return to the previous page or adjust the publishing filter."
              : "Create the first service to begin building the public services catalogue."
          }
          action={
            pageIndex > 0 ? (
              <Button type="button" variant="outline" onClick={goToPreviousPage}>
                Previous page
              </Button>
            ) : (
              <Button asChild>
                <Link href="/admin/services/new/">Create service</Link>
              </Button>
            )
          }
        />
      )}

      {!servicesQuery.isPending &&
        !servicesQuery.isError &&
        services.length > 0 &&
        visibleServices.length === 0 && (
          <EmptyState
            title="No services match this search"
            description="Search applies to the current bounded page. Try another phrase or clear it."
            action={
              <Button type="button" variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            }
          />
        )}

      {!servicesQuery.isPending &&
        !servicesQuery.isError &&
        visibleServices.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="min-w-72 whitespace-normal">
                      <div className="flex items-center gap-3">
                        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <ResponsiveImage
                            src={service.imageUrl}
                            alt=""
                            width={48}
                            height={48}
                            widths={[48, 96]}
                            sizes="48px"
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{service.title}</p>
                          <p className="mt-0.5 truncate font-mono text-[0.65rem] text-muted-foreground">
                            {service.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <StatusBadge status={service.published ? "published" : "draft"} />
                        {service.featured && <StatusBadge status="featured" tone="warning" />}
                      </div>
                    </TableCell>
                    <TableCell>{service.displayOrder}</TableCell>
                    <TableCell>{formatDate(service.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link
                            href={`/admin/services/edit/?id=${encodeURIComponent(service.id)}`}
                            aria-label={`Edit ${service.title}`}
                          >
                            <PencilIcon aria-hidden="true" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${service.title}`}
                          onClick={() => setServiceToDelete(service)}
                        >
                          <Trash2Icon aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      {!servicesQuery.isPending &&
        !servicesQuery.isError &&
        (pageIndex > 0 || Boolean(servicesQuery.data?.hasMore)) && (
          <PaginationControls
            currentPage={pageIndex + 1}
            hasPreviousPage={pageIndex > 0}
            hasNextPage={Boolean(servicesQuery.data?.hasMore)}
            isLoading={servicesQuery.isFetching}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
          />
        )}

      <AlertDialog
        open={Boolean(serviceToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setServiceToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete service?</AlertDialogTitle>
            <AlertDialogDescription>
              “{serviceToDelete?.title}” will be permanently removed from Firestore. Its Cloudinary image will not be deleted.
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
                event.preventDefault()
                void confirmDelete()
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete service"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { ServicesAdminScreen }
