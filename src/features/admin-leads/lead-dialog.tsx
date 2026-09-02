"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSaveLead } from "@/features/admin-leads/hooks";
import {
  LEAD_STATUSES,
  leadUpdateSchema,
  type LeadUpdateFormValues,
} from "@/features/admin-leads/schema";
import { formatDate } from "@/lib/date";
import type { Lead } from "@/types/lead";

interface LeadDialogProps {
  canManage: boolean;
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}

export function LeadDialog({ canManage, lead, onOpenChange }: LeadDialogProps) {
  const mutation = useSaveLead();
  const form = useForm<LeadUpdateFormValues>({
    resolver: zodResolver(leadUpdateSchema),
    defaultValues: { status: "NEW", adminNotes: "" },
  });
  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (lead) {
      mutation.reset();
      form.reset({ status: lead.status, adminNotes: lead.adminNotes });
    }
  }, [form, lead, mutation]);

  const submit = async (values: LeadUpdateFormValues) => {
    if (!lead || !canManage) {
      return;
    }

    try {
      await mutation.mutateAsync({ leadId: lead.id, values });
      onOpenChange(false);
    } catch {
      // A user-safe mutation message is rendered inside the dialog.
    }
  };

  return (
    <Dialog open={Boolean(lead)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{lead?.name ?? "Enquiry"}</DialogTitle>
          <DialogDescription>
            Received {formatDate(lead?.createdAt)} from {lead?.source || "website"}.
          </DialogDescription>
        </DialogHeader>

        {lead && (
          <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
            <dl className="grid gap-4 rounded-2xl border bg-muted/25 p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="mt-1 break-words font-medium">{lead.phone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 break-words font-medium">{lead.email || "Not provided"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Interested service</dt>
                <dd className="mt-1 font-medium">{lead.service || "General enquiry"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Source</dt>
                <dd className="mt-1 font-medium">{lead.source}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Message</dt>
                <dd className="mt-2 whitespace-pre-wrap leading-6">{lead.message}</dd>
              </div>
            </dl>

            {mutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Update failed</AlertTitle>
                <AlertDescription>{mutation.error.message}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-5 sm:grid-cols-[14rem_1fr]">
              <div className="space-y-2">
                <Label htmlFor="lead-status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) =>
                    form.setValue("status", value as LeadUpdateFormValues["status"], {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  disabled={!canManage || mutation.isPending}
                >
                  <SelectTrigger id="lead-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-notes">Internal notes</Label>
                <Textarea
                  id="lead-notes"
                  rows={6}
                  disabled={!canManage || mutation.isPending}
                  {...form.register("adminNotes")}
                />
                {form.formState.errors.adminNotes?.message && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.adminNotes.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              {canManage && (
                <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                  {mutation.isPending ? "Saving…" : "Save enquiry"}
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
