"use client";

import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

import {
  AdminBannersAccessDenied,
  AdminBannersAccessLoading,
} from "./access-state";
import { BannerForm } from "./banner-form";

export function BannerCreateScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_BANNERS);

  if (admin.isLoading) {
    return <AdminBannersAccessLoading />;
  }
  if (!canManage) {
    return <AdminBannersAccessDenied />;
  }

  return <BannerForm />;
}
