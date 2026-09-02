"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { Button } from "@/components/ui/button";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";

import {
  AdminBannersAccessDenied,
  AdminBannersAccessLoading,
} from "./access-state";
import { BannerForm } from "./banner-form";
import { useAdminBanner } from "./hooks";

function BackToBanners() {
  return (
    <Button asChild variant="outline">
      <Link href={ADMIN_ROUTES.banners}>
        <ArrowLeft aria-hidden="true" />
        Back to banners
      </Link>
    </Button>
  );
}

export function BannerEditScreen() {
  const searchParams = useSearchParams();
  const bannerId = searchParams.get("id")?.trim() ?? "";
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BANNERS);
  const bannerQuery = useAdminBanner(bannerId, canManage && Boolean(bannerId));

  if (admin.isLoading) {
    return <AdminBannersAccessLoading />;
  }
  if (!canManage) {
    return <AdminBannersAccessDenied />;
  }
  if (!bannerId) {
    return (
      <EmptyState
        title="No banner selected"
        description="Open a banner from the banner list to edit it."
        action={<BackToBanners />}
      />
    );
  }
  if (bannerQuery.isPending) {
    return <LoadingState variant="page" message="Loading banner editor…" />;
  }
  if (bannerQuery.isError) {
    return (
      <ErrorState
        title="Banner editor unavailable"
        description={bannerQuery.error.message}
        onRetry={() => void bannerQuery.refetch()}
      />
    );
  }
  if (!bannerQuery.data) {
    return (
      <EmptyState
        title="Banner not found"
        description="This banner may have been deleted or the link may be invalid."
        action={<BackToBanners />}
      />
    );
  }

  return <BannerForm key={bannerQuery.data.id} initialBanner={bannerQuery.data} />;
}
