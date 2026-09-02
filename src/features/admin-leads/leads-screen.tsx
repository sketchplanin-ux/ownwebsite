"use client";

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Download, Eye, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageHeading } from "@/components/common/page-heading";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useDeleteLead, useAdminLeadPage } from "@/features/admin-leads/hooks";
import { LeadDialog } from "@/features/admin-leads/lead-dialog";
import { LEAD_STATUSES } from "@/features/admin-leads/schema";
import { useAdmin } from "@/hooks/use-admin";
import { createCsv } from "@/lib/csv";
import { formatDate, toDate } from "@/lib/date";
import type { Lead, LeadStatus } from "@/types/lead";

type LeadFilter = LeadStatus | "ALL";
type Cursor = QueryDocumentSnapshot<DocumentData> | null;

function downloadLeads(rows: readonly Lead[]) {
  const csv = createCsv(
    rows,
    [
      { header: "Name", value: (lead) => lead.name },
      { header: "Phone", value: (lead) => lead.phone },
      { header: "Email", value: (lead) => lead.email },
      { header: "Service", value: (lead) => lead.service },
      { header: "Message", value: (lead) => lead.message },
      { header: "Source", value: (lead) => lead.source },
      { header: "Status", value: (lead) => lead.status },
      { header: "Internal notes", value: (lead) => lead.adminNotes },
      { header: "Created", value: (lead) => toDate(lead.createdAt) },
    ],
    { includeBom: true },
  );
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sketchplan-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function LeadsLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading enquiries">
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

export function LeadsScreen() {
  const admin = useAdmin();
  const canView = admin.can(PERMISSIONS.VIEW_LEADS);
  const canManage = admin.can(PERMISSIONS.MANAGE_LEADS);
  const [status, setStatus] = useState<LeadFilter>("ALL");
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<Cursor>(null);
  const [history, setHistory] = useState<Cursor[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const leadQuery = useAdminLeadPage({ cursor, status, pageSize: 20 });
  const deleteMutation = useDeleteLead();

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en-IN");
    const items = leadQuery.data?.items ?? [];
    if (!term) {
      return items;
    }
    return items.filter((lead) =>
      [lead.name, lead.phone, lead.email ?? ""]
        .some((value) => value.toLocaleLowerCase("en-IN").includes(term)),
    );
  }, [leadQuery.data?.items, search]);

  const changeStatus = (value: LeadFilter) => {
    setStatus(value);
    setCursor(null);
    setHistory([]);
  };

  if (!canView) {
    return (
      <ErrorState
        title="Lead access unavailable"
        description="Your admin role does not include permission to view enquiries."
      />
    );
  }

  const confirmDelete = async () => {
    if (!deleteTarget || !canManage) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // The error remains visible in the page alert.
    }
  };

  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Client pipeline"
        title="Leads"
        description="Review website enquiries, record follow-up, and export the currently visible results."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => void leadQuery.refetch()}
              disabled={leadQuery.isFetching}
            >
              <RefreshCw aria-hidden="true" className={leadQuery.isFetching ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button
              type="button"
              onClick={() => downloadLeads(visibleLeads)}
              disabled={visibleLeads.length === 0}
            >
              <Download aria-hidden="true" />
              Export visible CSV
            </Button>
          </>
        }
      />

      {!canManage && (
        <Alert>
          <AlertTitle>View-only access</AlertTitle>
          <AlertDescription>
            Editors can review and export enquiries. An Admin or Super Admin must change status, notes, or delete records.
          </AlertDescription>
        </Alert>
      )}

      {deleteMutation.isError && (
        <Alert variant="destructive">
          <AlertTitle>Could not delete the enquiry</AlertTitle>
          <AlertDescription>{deleteMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="relative">
            <span className="sr-only">Search visible enquiries</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search this page by name, phone, or email"
              className="pl-9"
            />
          </label>
          <Select value={status} onValueChange={(value) => changeStatus(value as LeadFilter)}>
            <SelectTrigger className="w-full" aria-label="Filter enquiries by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {LEAD_STATUSES.map((item) => (
                <SelectItem key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {leadQuery.isPending ? (
        <LeadsLoading />
      ) : leadQuery.isError ? (
        <ErrorState
          title="Enquiries unavailable"
          description={leadQuery.error.message}
          onRetry={() => void leadQuery.refetch()}
        />
      ) : leadQuery.data.items.length === 0 ? (
        <EmptyState
          title="No enquiries found"
          description={status === "ALL" ? "New website enquiries will appear here." : "No enquiries match this status."}
        />
      ) : (
        <Card className="overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <p className="font-medium">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{lead.phone}</p>
                      {lead.email && <p className="mt-1 text-xs text-muted-foreground">{lead.email}</p>}
                    </TableCell>
                    <TableCell>{lead.service || "General enquiry"}</TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(lead.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="icon-sm" variant="outline" onClick={() => setSelectedLead(lead)} aria-label={`View enquiry from ${lead.name}`}>
                          <Eye aria-hidden="true" />
                        </Button>
                        {canManage && (
                          <Button type="button" size="icon-sm" variant="outline" onClick={() => setDeleteTarget(lead)} aria-label={`Delete enquiry from ${lead.name}`}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {visibleLeads.length === 0 && (
            <p className="border-t px-4 py-12 text-center text-sm text-muted-foreground">
              No enquiries on this page match that search.
            </p>
          )}
          <PaginationControls
            className="border-t p-4"
            currentPage={history.length + 1}
            hasPreviousPage={history.length > 0}
            hasNextPage={leadQuery.data.hasMore}
            isLoading={leadQuery.isFetching}
            onPreviousPage={() => {
              const previous = history.at(-1) ?? null;
              setHistory((items) => items.slice(0, -1));
              setCursor(previous);
            }}
            onNextPage={() => {
              if (!leadQuery.data.nextCursor) return;
              setHistory((items) => [...items, cursor]);
              setCursor(leadQuery.data.nextCursor);
            }}
          />
        </Card>
      )}

      <LeadDialog canManage={canManage} lead={selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the enquiry from {deleteTarget?.name}. Export or copy anything you need first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={deleteMutation.isPending} onClick={(event) => { event.preventDefault(); void confirmDelete(); }}>
              {deleteMutation.isPending ? "Deleting…" : "Delete enquiry"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
