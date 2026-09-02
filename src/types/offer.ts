import type {
  AuditedDocument,
  DisplayOrdered,
  FirestoreTimestamp,
} from "./common";

export interface Offer extends AuditedDocument, DisplayOrdered {
  title: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  imageAlt?: string;
  startAt?: FirestoreTimestamp;
  endAt?: FirestoreTimestamp;
  buttonText?: string;
  buttonUrl?: string;
  active: boolean;
  showOnHomepage: boolean;
  showAsPopup: boolean;
}

export type OfferInput = Omit<Offer, "id" | "createdAt" | "updatedAt">;
