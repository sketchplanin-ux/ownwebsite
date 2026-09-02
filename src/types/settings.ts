import type { FirestoreTimestamp } from "./common";

export type SiteSettingsDocumentId = "general" | "social" | "seo";

interface SettingsDocument<TId extends SiteSettingsDocumentId> {
  id: TId;
  updatedAt: FirestoreTimestamp;
}

export interface GeneralSettings extends SettingsDocument<"general"> {
  companyName: string;
  logoUrl: string;
  logoPublicId?: string;
  logoAlt: string;
  faviconUrl: string;
  faviconPublicId?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  officeHours: string;
  footerText: string;
  brandAccentColor: string;
}

export interface SocialSettings extends SettingsDocument<"social"> {
  facebookUrl: string;
  instagramUrl: string;
  linkedInUrl: string;
  youtubeUrl: string;
  whatsappUrl: string;
}

export interface CompanySchemaSettings {
  name: string;
  legalName?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  priceRange?: string;
  areaServed?: string[];
}

export interface SeoSettings extends SettingsDocument<"seo"> {
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  defaultOpenGraphImageUrl: string;
  defaultOpenGraphImagePublicId?: string;
  defaultOpenGraphImageAlt: string;
  siteUrl: string;
  companySchema: CompanySchemaSettings;
}

export type SiteSettings = GeneralSettings | SocialSettings | SeoSettings;
