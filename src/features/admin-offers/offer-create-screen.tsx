"use client";

import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

import {
  AdminOffersAccessDenied,
  AdminOffersAccessLoading,
} from "./access-state";
import { OfferForm } from "./offer-form";

export function OfferCreateScreen() {
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_OFFERS);

  if (admin.isLoading) {
    return <AdminOffersAccessLoading />;
  }
  if (!canManage) {
    return <AdminOffersAccessDenied />;
  }

  return <OfferForm />;
}
