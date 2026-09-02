import type {
  AuditedDocument,
  DisplayOrdered,
  Publishable,
  SeoFields,
} from "./common";

export interface Service
  extends AuditedDocument,
    DisplayOrdered,
    Publishable,
    SeoFields {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  imageAlt: string;
  icon?: string;
  features?: string[];
  featured: boolean;
}

export type ServiceInput = Omit<
  Service,
  "id" | "createdAt" | "updatedAt"
>;
