import type { GeneralSettings } from "@/types/settings";

export type PublicGeneralSettings = Omit<
  GeneralSettings,
  "id" | "updatedAt"
>;

/** Only verified or explicitly requested seed values belong in public fallbacks. */
export const DEFAULT_GENERAL_SETTINGS: Readonly<PublicGeneralSettings> =
  Object.freeze({
    companyName: "SKETCHPLAN",
    logoUrl: "",
    logoAlt: "SKETCHPLAN logo",
    faviconUrl: "",
    phone: "",
    whatsappNumber: "",
    email: "sketchplan.amc@gmail.com",
    address: "",
    googleMapsUrl: "",
    officeHours: "",
    footerText: "Architecture, Interior & Planning",
    brandAccentColor: "",
  });
