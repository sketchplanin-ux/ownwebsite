import { where } from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import { readCollection } from "@/firebase/firestore";
import { isScheduledContentVisible } from "@/lib/date";
import type { Offer } from "@/types/offer";

const MAX_PUBLIC_OFFERS = 8;

function offerOrder(offer: Offer): number {
  return Number.isFinite(offer.displayOrder)
    ? offer.displayOrder
    : Number.MAX_SAFE_INTEGER;
}

/** Reads a bounded active set, then applies optional schedules client-side. */
export async function getActiveOffers(now = new Date()): Promise<Offer[]> {
  const offers = await readCollection<Offer>(COLLECTIONS.offers, {
    constraints: [where("active", "==", true)],
    maxResults: MAX_PUBLIC_OFFERS,
  });

  return offers
    .filter((offer) =>
      isScheduledContentVisible(
        offer.active,
        offer.startAt,
        offer.endAt,
        now,
      ),
    )
    .sort((first, second) => offerOrder(first) - offerOrder(second));
}
