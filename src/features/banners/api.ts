import { orderBy, where } from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import { readCollection } from "@/firebase/firestore";
import { isScheduledContentVisible } from "@/lib/date";
import type { Banner } from "@/types/banner";

const MAX_PUBLIC_BANNERS = 8;

/**
 * Reads only active banners. Date ranges are intentionally evaluated on the
 * client so unscheduled documents remain queryable without broad reads.
 */
export async function getActiveBanners(now = new Date()): Promise<Banner[]> {
  const banners = await readCollection<Banner>(COLLECTIONS.banners, {
    constraints: [
      where("active", "==", true),
      orderBy("displayOrder", "asc"),
    ],
    maxResults: MAX_PUBLIC_BANNERS,
  });

  return banners.filter((banner) =>
    isScheduledContentVisible(
      banner.active,
      banner.startAt,
      banner.endAt,
      now,
    ),
  );
}
