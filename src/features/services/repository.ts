import {
  orderBy,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  readCollection,
  readPaginatedCollection,
} from "@/firebase/firestore";
import type { Service } from "@/types/service";

type ServiceDocument = Omit<Service, "id">;

export type ServicePageCursor = QueryDocumentSnapshot<DocumentData>;

export interface PublicServicePage {
  items: Service[];
  nextCursor: ServicePageCursor | null;
  hasMore: boolean;
}

export interface PublicServicePageOptions {
  cursor?: ServicePageCursor | null;
  pageSize?: number;
}

export const DEFAULT_SERVICE_PAGE_SIZE = 12;
export const DEFAULT_FEATURED_SERVICE_LIMIT = 4;

const MAX_SERVICE_PAGE_SIZE = 24;
const MAX_FEATURED_SERVICE_LIMIT = 8;
const MAX_SERVICE_SLUG_LENGTH = 160;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function boundedInteger(
  value: number | undefined,
  fallback: number,
  maximum: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(maximum, Math.max(1, Math.floor(value)));
}

export function normalizeServicePageSize(value?: number): number {
  return boundedInteger(
    value,
    DEFAULT_SERVICE_PAGE_SIZE,
    MAX_SERVICE_PAGE_SIZE,
  );
}

export function normalizeFeaturedServiceLimit(value?: number): number {
  return boundedInteger(
    value,
    DEFAULT_FEATURED_SERVICE_LIMIT,
    MAX_FEATURED_SERVICE_LIMIT,
  );
}

export function normalizePublicServiceSlug(
  value: string | null | undefined,
): string | null {
  const slug = value?.trim().toLowerCase() ?? "";

  if (
    slug.length === 0 ||
    slug.length > MAX_SERVICE_SLUG_LENGTH ||
    !PUBLIC_SLUG_PATTERN.test(slug)
  ) {
    return null;
  }

  return slug;
}

/** Reads one bounded page of published services in their editorial order. */
export async function getPublishedServicesPage(
  options: PublicServicePageOptions = {},
): Promise<PublicServicePage> {
  const result = await readPaginatedCollection<ServiceDocument>(
    COLLECTIONS.services,
    {
      constraints: [
        where("published", "==", true),
        orderBy("displayOrder", "asc"),
      ],
      cursor: options.cursor,
      pageSize: normalizeServicePageSize(options.pageSize),
    },
  );

  return {
    items: result.items,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
}

/** Reads a small, explicitly bounded homepage selection. */
export async function getFeaturedServices(
  requestedLimit?: number,
): Promise<Service[]> {
  return readCollection<ServiceDocument>(COLLECTIONS.services, {
    constraints: [
      where("published", "==", true),
      where("featured", "==", true),
      orderBy("displayOrder", "asc"),
    ],
    maxResults: normalizeFeaturedServiceLimit(requestedLimit),
  });
}

/**
 * Resolves a public service without ever falling back to a collection scan.
 * The published predicate is intentionally part of the Firestore query.
 */
export async function getPublishedServiceBySlug(
  candidateSlug: string | null | undefined,
): Promise<Service | null> {
  const slug = normalizePublicServiceSlug(candidateSlug);
  if (!slug) {
    return null;
  }

  const services = await readCollection<ServiceDocument>(COLLECTIONS.services, {
    constraints: [
      where("slug", "==", slug),
      where("published", "==", true),
    ],
    maxResults: 1,
  });

  return services[0] ?? null;
}
