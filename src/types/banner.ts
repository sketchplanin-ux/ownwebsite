import type {
  AuditedDocument,
  DisplayOrdered,
  FirestoreTimestamp,
} from "./common";

export interface Banner extends AuditedDocument, DisplayOrdered {
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  desktopImagePublicId?: string;
  desktopImageAlt: string;
  mobileImageUrl?: string;
  mobileImagePublicId?: string;
  mobileImageAlt?: string;
  buttonText?: string;
  buttonUrl?: string;
  startAt?: FirestoreTimestamp;
  endAt?: FirestoreTimestamp;
  active: boolean;
}

export type BannerInput = Omit<Banner, "id" | "createdAt" | "updatedAt">;
