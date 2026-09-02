import { deleteField, orderBy } from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  createDocument,
  readCollection,
  readDocument,
  removeDocument,
  updateDocument,
} from "@/firebase/firestore";
import type { Banner, BannerInput } from "@/types/banner";

type StoredBanner = Omit<Banner, "id">;

export const ADMIN_BANNER_READ_LIMIT = 100;

function normalizeDocumentId(value: string): string {
  const id = value.trim();
  if (!id || id.includes("/")) {
    throw new Error("The requested banner identifier is invalid.");
  }
  return id;
}

export function getAdminBanners(): Promise<Banner[]> {
  return readCollection<StoredBanner>(COLLECTIONS.banners, {
    constraints: [orderBy("updatedAt", "desc")],
    maxResults: ADMIN_BANNER_READ_LIMIT,
  });
}

export function getAdminBanner(bannerId: string): Promise<Banner | null> {
  return readDocument<StoredBanner>(
    COLLECTIONS.banners,
    normalizeDocumentId(bannerId),
  );
}

export function createAdminBanner(input: BannerInput): Promise<string> {
  return createDocument<BannerInput>(COLLECTIONS.banners, input);
}

export function updateAdminBanner(
  bannerId: string,
  input: BannerInput,
): Promise<void> {
  return updateDocument<StoredBanner>(
    COLLECTIONS.banners,
    normalizeDocumentId(bannerId),
    {
      ...input,
      ...(!input.subtitle ? { subtitle: deleteField() } : {}),
      ...(!input.desktopImagePublicId
        ? { desktopImagePublicId: deleteField() }
        : {}),
      ...(!input.mobileImageUrl ? { mobileImageUrl: deleteField() } : {}),
      ...(!input.mobileImagePublicId
        ? { mobileImagePublicId: deleteField() }
        : {}),
      ...(!input.mobileImageAlt ? { mobileImageAlt: deleteField() } : {}),
      ...(!input.buttonText ? { buttonText: deleteField() } : {}),
      ...(!input.buttonUrl ? { buttonUrl: deleteField() } : {}),
      ...(!input.startAt ? { startAt: deleteField() } : {}),
      ...(!input.endAt ? { endAt: deleteField() } : {}),
    },
  );
}

export function deleteAdminBanner(bannerId: string): Promise<void> {
  return removeDocument(COLLECTIONS.banners, normalizeDocumentId(bannerId));
}
