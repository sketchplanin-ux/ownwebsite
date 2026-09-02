import type { FirestoreTimestamp } from "./common";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP"
  | "CONVERTED"
  | "CLOSED"
  | "SPAM";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  source: string;
  status: LeadStatus;
  adminNotes: string;
  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
}

/** Publicly writable fields. Status and admin notes are intentionally absent. */
export interface LeadSubmission {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message: string;
  source: string;
}

/** Form-only anti-spam and consent fields; neither grants admin capabilities. */
export interface LeadFormValues extends LeadSubmission {
  consent: boolean;
  website: string;
}
