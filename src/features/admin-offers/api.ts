import { deleteField, orderBy } from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  createDocument,
  readCollection,
  readDocument,
  removeDocument,
  updateDocument,
} from "@/firebase/firestore";
import type { Offer, OfferInput } from "@/types/offer";

type StoredOffer = Omit<Offer, "id">;

export const ADMIN_OFFER_READ_LIMIT = 100;

function normalizeDocumentId(value: string): string {
  const id = value.trim();
  if (!id || id.includes("/")) {
    throw new Error("The requested offer identifier is invalid.");
  }
  return id;
}

export function getAdminOffers(): Promise<Offer[]> {
  return readCollection<StoredOffer>(COLLECTIONS.offers, {
    constraints: [orderBy("updatedAt", "desc")],
    maxResults: ADMIN_OFFER_READ_LIMIT,
  });
}

export function getAdminOffer(offerId: string): Promise<Offer | null> {
  return readDocument<StoredOffer>(
    COLLECTIONS.offers,
    normalizeDocumentId(offerId),
  );
}

export function createAdminOffer(input: OfferInput): Promise<string> {
  return createDocument<OfferInput>(COLLECTIONS.offers, input);
}

export function updateAdminOffer(
  offerId: string,
  input: OfferInput,
): Promise<void> {
  return updateDocument<StoredOffer>(
    COLLECTIONS.offers,
    normalizeDocumentId(offerId),
    {
      ...input,
      ...(!input.imageUrl ? { imageUrl: deleteField() } : {}),
      ...(!input.imagePublicId ? { imagePublicId: deleteField() } : {}),
      ...(!input.imageAlt ? { imageAlt: deleteField() } : {}),
      ...(!input.buttonText ? { buttonText: deleteField() } : {}),
      ...(!input.buttonUrl ? { buttonUrl: deleteField() } : {}),
      ...(!input.startAt ? { startAt: deleteField() } : {}),
      ...(!input.endAt ? { endAt: deleteField() } : {}),
    },
  );
}

export function deleteAdminOffer(offerId: string): Promise<void> {
  return removeDocument(COLLECTIONS.offers, normalizeDocumentId(offerId));
}
