"use client";

import {
  BookOpen,
  BriefcaseBusiness,
  Eye,
  Images,
  Inbox,
  Layers3,
  Megaphone,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { StatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/features/dashboard/hooks";
import { formatDate } from "@/lib/date";

const metricDefinitions = [
  { key: "services", label: "Services", icon: Layers3 },
  { key: "projects", label: "Projects", icon: BriefcaseBusiness },
  { key: "publishedProjects", label: "Published projects", icon: Eye },
  { key: "blogs", label: "Blog articles", icon: BookOpen },
  { key: "publishedBlogs", label: "Published articles", icon: Sparkles },
  { key: "activeBanners", label: "Active banners", icon: Images },
  { key: "activeOffers", label: "Active offers", icon: Megaphone },
  { key: "newLeads", label: "New enquiries", icon: Inbox },
] as const;

function DashboardLoading() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map((metric) => (
          <Skeleton key={metric.key} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <span className="sr-only">Loading dashboard data…</span>
    </div>
  );
}

export function DashboardScreen() {
  const dashboardQuery = useDashboardData();

  if (dashboardQuery.isPending) {
    return <DashboardLoading />;
  }

  if (dashboardQuery.isError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description={dashboardQuery.error.message}
        onRetry={() => void dashboardQuery.refetch()}
      />
    );
  }

  const { counts, recentActivity, recentLeads } = dashboardQuery.data;

  return (
    <div className="space-y-8">
      <section aria-label="Content summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map(({ key, label, icon: Icon }) => (
          <Card key={key} className="relative overflow-hidden rounded-2xl border-border/70">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-brand" />
            <CardContent className="flex items-start justify-between gap-5 p-6">
              <div>
                <p className="text-3xl font-semibold tracking-tight">{counts[key]}</p>
                <p className="mt-2 text-sm text-muted-foreground">{label}</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon aria-hidden="true" className="size-5" />
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle>Recent enquiries</CardTitle>
            <Link className="text-sm font-semibold text-brand hover:underline" href="/admin/leads/">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentLeads.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No enquiries yet.</p>
            ) : (
              <ul className="divide-y">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{lead.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(lead.createdAt)} · {lead.service || "General enquiry"}
                      </p>
                    </div>
                    <StatusBadge status={lead.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Recently updated</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No content activity yet.</p>
            ) : (
              <ul className="divide-y">
                {recentActivity.map((activity) => (
                  <li key={`${activity.kind}-${activity.id}`} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{activity.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Updated {formatDate(activity.updatedAt)}</p>
                    </div>
                    <StatusBadge status={activity.kind} tone="neutral" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
