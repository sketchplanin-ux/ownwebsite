import {
  collection,
  getCountFromServer,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import { firestore } from "@/firebase/config";
import { logFirebaseError, mapFirebaseError } from "@/firebase/errors";
import { readCollection } from "@/firebase/firestore";
import { toDate } from "@/lib/date";
import type { Blog } from "@/types/blog";
import type { Lead } from "@/types/lead";
import type { Project } from "@/types/project";
import type { Service } from "@/types/service";

type StoredLead = Omit<Lead, "id">;
type StoredService = Omit<Service, "id">;
type StoredProject = Omit<Project, "id">;
type StoredBlog = Omit<Blog, "id">;

export interface DashboardCounts {
  services: number;
  projects: number;
  publishedProjects: number;
  blogs: number;
  publishedBlogs: number;
  activeBanners: number;
  activeOffers: number;
  newLeads: number;
}

export interface DashboardActivity {
  id: string;
  kind: "Blog" | "Project" | "Service";
  title: string;
  updatedAt: unknown;
}

export interface DashboardData {
  counts: DashboardCounts;
  recentLeads: Lead[];
  recentActivity: DashboardActivity[];
}

async function countCollection(
  collectionName: string,
  field?: string,
  value?: string | boolean,
): Promise<number> {
  const reference = collection(firestore, collectionName);
  const countQuery = field ? query(reference, where(field, "==", value)) : reference;
  const snapshot = await getCountFromServer(countQuery);
  return snapshot.data().count;
}

function activityTime(activity: DashboardActivity): number {
  return toDate(activity.updatedAt)?.getTime() ?? 0;
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const [
      services,
      projects,
      publishedProjects,
      blogs,
      publishedBlogs,
      activeBanners,
      activeOffers,
      newLeads,
      recentLeads,
      recentServices,
      recentProjects,
      recentBlogs,
    ] = await Promise.all([
      countCollection(COLLECTIONS.services),
      countCollection(COLLECTIONS.projects),
      countCollection(COLLECTIONS.projects, "published", true),
      countCollection(COLLECTIONS.blogs),
      countCollection(COLLECTIONS.blogs, "status", "PUBLISHED"),
      countCollection(COLLECTIONS.banners, "active", true),
      countCollection(COLLECTIONS.offers, "active", true),
      countCollection(COLLECTIONS.leads, "status", "NEW"),
      readCollection<StoredLead>(COLLECTIONS.leads, {
        constraints: [orderBy("createdAt", "desc")],
        maxResults: 5,
      }),
      readCollection<StoredService>(COLLECTIONS.services, {
        constraints: [orderBy("updatedAt", "desc")],
        maxResults: 3,
      }),
      readCollection<StoredProject>(COLLECTIONS.projects, {
        constraints: [orderBy("updatedAt", "desc")],
        maxResults: 3,
      }),
      readCollection<StoredBlog>(COLLECTIONS.blogs, {
        constraints: [orderBy("updatedAt", "desc")],
        maxResults: 3,
      }),
    ]);

    const recentActivity: DashboardActivity[] = [
      ...recentServices.map((item) => ({
        id: item.id,
        kind: "Service" as const,
        title: item.title,
        updatedAt: item.updatedAt,
      })),
      ...recentProjects.map((item) => ({
        id: item.id,
        kind: "Project" as const,
        title: item.title,
        updatedAt: item.updatedAt,
      })),
      ...recentBlogs.map((item) => ({
        id: item.id,
        kind: "Blog" as const,
        title: item.title,
        updatedAt: item.updatedAt,
      })),
    ]
      .sort((first, second) => activityTime(second) - activityTime(first))
      .slice(0, 6);

    return {
      counts: {
        services,
        projects,
        publishedProjects,
        blogs,
        publishedBlogs,
        activeBanners,
        activeOffers,
        newLeads,
      },
      recentLeads,
      recentActivity,
    };
  } catch (error) {
    logFirebaseError("Load admin dashboard", error);
    throw mapFirebaseError(
      error,
      "The dashboard could not be loaded. Check your connection and permissions.",
    );
  }
}
