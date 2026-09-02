import {
  orderBy,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import {
  readCollection,
  readPaginatedCollection,
} from "@/firebase/firestore";
import type { Project, ProjectCategory } from "@/types/project";

type ProjectDocument = Omit<Project, "id">;
type ProjectCategoryDocument = Omit<ProjectCategory, "id">;

export type ProjectPageCursor = QueryDocumentSnapshot<DocumentData>;

export interface PublicProjectPage {
  items: Project[];
  nextCursor: ProjectPageCursor | null;
  hasMore: boolean;
}

export interface PublicProjectPageOptions {
  category?: string | null;
  cursor?: ProjectPageCursor | null;
  pageSize?: number;
}

export const DEFAULT_PROJECT_PAGE_SIZE = 9;
export const DEFAULT_FEATURED_PROJECT_LIMIT = 6;
export const DEFAULT_PROJECT_CATEGORY_LIMIT = 20;

const MAX_PROJECT_PAGE_SIZE = 18;
const MAX_FEATURED_PROJECT_LIMIT = 8;
const MAX_PROJECT_CATEGORY_LIMIT = 40;
const MAX_PROJECT_SLUG_LENGTH = 160;
const MAX_PROJECT_CATEGORY_LENGTH = 100;
const PUBLIC_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

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

export function normalizeProjectPageSize(value?: number): number {
  return boundedInteger(
    value,
    DEFAULT_PROJECT_PAGE_SIZE,
    MAX_PROJECT_PAGE_SIZE,
  );
}

export function normalizeFeaturedProjectLimit(value?: number): number {
  return boundedInteger(
    value,
    DEFAULT_FEATURED_PROJECT_LIMIT,
    MAX_FEATURED_PROJECT_LIMIT,
  );
}

export function normalizeProjectCategoryLimit(value?: number): number {
  return boundedInteger(
    value,
    DEFAULT_PROJECT_CATEGORY_LIMIT,
    MAX_PROJECT_CATEGORY_LIMIT,
  );
}

export function normalizePublicProjectSlug(
  value: string | null | undefined,
): string | null {
  const slug = value?.trim().toLowerCase() ?? "";

  if (
    slug.length === 0 ||
    slug.length > MAX_PROJECT_SLUG_LENGTH ||
    !PUBLIC_SLUG_PATTERN.test(slug)
  ) {
    return null;
  }

  return slug;
}

export function normalizeProjectCategory(
  value: string | null | undefined,
): string | null {
  const category = value?.trim() ?? "";
  if (
    category.length === 0 ||
    category.length > MAX_PROJECT_CATEGORY_LENGTH ||
    CONTROL_CHARACTER_PATTERN.test(category)
  ) {
    return null;
  }

  return category;
}

/** Reads one bounded cursor page of published projects. */
export async function getPublishedProjectsPage(
  options: PublicProjectPageOptions = {},
): Promise<PublicProjectPage> {
  const category = normalizeProjectCategory(options.category);
  const constraints: QueryConstraint[] = [where("published", "==", true)];

  if (category) {
    constraints.push(where("category", "==", category));
  }

  constraints.push(orderBy("displayOrder", "asc"));

  const result = await readPaginatedCollection<ProjectDocument>(
    COLLECTIONS.projects,
    {
      constraints,
      cursor: options.cursor,
      pageSize: normalizeProjectPageSize(options.pageSize),
    },
  );

  return {
    items: result.items,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  };
}

/** Reads a small, explicitly bounded homepage selection. */
export async function getFeaturedProjects(
  requestedLimit?: number,
): Promise<Project[]> {
  return readCollection<ProjectDocument>(COLLECTIONS.projects, {
    constraints: [
      where("published", "==", true),
      where("featured", "==", true),
      orderBy("displayOrder", "asc"),
    ],
    maxResults: normalizeFeaturedProjectLimit(requestedLimit),
  });
}

/** Fetches only public categories, with a hard upper bound. */
export async function getPublishedProjectCategories(
  requestedLimit?: number,
): Promise<ProjectCategory[]> {
  return readCollection<ProjectCategoryDocument>(
    COLLECTIONS.projectCategories,
    {
      constraints: [
        where("published", "==", true),
        orderBy("displayOrder", "asc"),
      ],
      maxResults: normalizeProjectCategoryLimit(requestedLimit),
    },
  );
}

/**
 * Resolves a public project with a two-predicate, single-result query. It never
 * downloads unpublished projects or scans the collection in the browser.
 */
export async function getPublishedProjectBySlug(
  candidateSlug: string | null | undefined,
): Promise<Project | null> {
  const slug = normalizePublicProjectSlug(candidateSlug);
  if (!slug) {
    return null;
  }

  const projects = await readCollection<ProjectDocument>(COLLECTIONS.projects, {
    constraints: [
      where("slug", "==", slug),
      where("published", "==", true),
    ],
    maxResults: 1,
  });

  return projects[0] ?? null;
}
