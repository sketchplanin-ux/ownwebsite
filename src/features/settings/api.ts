import { COLLECTIONS, SETTINGS_DOCUMENTS } from "@/firebase/collections";
import { readDocument } from "@/firebase/firestore";
import type {
  GeneralSettings,
  SeoSettings,
  SocialSettings,
} from "@/types/settings";

type GeneralSettingsData = Omit<GeneralSettings, "id">;
type SocialSettingsData = Omit<SocialSettings, "id">;
type SeoSettingsData = Omit<SeoSettings, "id">;

/** Reads the single public general-settings document once. */
export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  const settings = await readDocument<GeneralSettingsData>(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.general,
  );

  return settings ? { ...settings, id: SETTINGS_DOCUMENTS.general } : null;
}

/** Reads the single public social-settings document once. */
export async function getSocialSettings(): Promise<SocialSettings | null> {
  const settings = await readDocument<SocialSettingsData>(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.social,
  );

  return settings ? { ...settings, id: SETTINGS_DOCUMENTS.social } : null;
}

/** Reads the single public SEO-settings document once. */
export async function getSeoSettings(): Promise<SeoSettings | null> {
  const settings = await readDocument<SeoSettingsData>(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.seo,
  );

  return settings ? { ...settings, id: SETTINGS_DOCUMENTS.seo } : null;
}
