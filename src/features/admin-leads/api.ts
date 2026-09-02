import {
  orderBy,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  readPaginatedCollection,
  removeDocument,
  updateDocument,
  type PaginatedResult,
} from "@/firebase/firestore";
import type { Lead, LeadStatus } from "@/types/lead";

export type StoredLead = Omit<Lead, "id">;

export interface AdminLeadPageOptions {
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  pageSize?: number;
  status?: LeadStatus | "ALL";
}

export function getAdminLeadPage({
  cursor = null,
  pageSize = 20,
  status = "ALL",
}: AdminLeadPageOptions): Promise<PaginatedResult<StoredLead>> {
  const constraints: QueryConstraint[] = [];

  if (status !== "ALL") {
    constraints.push(where("status", "==", status));
  }

  constraints.push(orderBy("createdAt", "desc"));

  return readPaginatedCollection<StoredLead>(COLLECTIONS.leads, {
    constraints,
    cursor,
    pageSize,
  });
}

export interface LeadUpdateInput {
  status: LeadStatus;
  adminNotes: string;
}

export function saveLeadUpdate(
  leadId: string,
  values: LeadUpdateInput,
): Promise<void> {
  return updateDocument<StoredLead>(COLLECTIONS.leads, leadId, values);
}

export function deleteLead(leadId: string): Promise<void> {
  return removeDocument(COLLECTIONS.leads, leadId);
}
