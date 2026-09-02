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
  AdminOffersAccessDenied,
  AdminOffersAccessLoading,
} from "./access-state";
import { useAdminOffer } from "./hooks";
import { OfferForm } from "./offer-form";

function BackToOffers() {
  return (
    <Button asChild variant="outline">
      <Link href={ADMIN_ROUTES.offers}>
        <ArrowLeft aria-hidden="true" />
        Back to offers
      </Link>
    </Button>
  );
}

export function OfferEditScreen() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("id")?.trim() ?? "";
  const admin = useAdmin();
  const canManage = admin.can(PERMISSIONS.MANAGE_OFFERS);
  const offerQuery = useAdminOffer(offerId, canManage && Boolean(offerId));

  if (admin.isLoading) {
    return <AdminOffersAccessLoading />;
  }
  if (!canManage) {
    return <AdminOffersAccessDenied />;
  }
  if (!offerId) {
    return (
      <EmptyState
        title="No offer selected"
        description="Open an offer from the offer list to edit it."
        action={<BackToOffers />}
      />
    );
  }
  if (offerQuery.isPending) {
    return <LoadingState variant="page" message="Loading offer editor…" />;
  }
  if (offerQuery.isError) {
    return (
      <ErrorState
        title="Offer editor unavailable"
        description={offerQuery.error.message}
        onRetry={() => void offerQuery.refetch()}
      />
    );
  }
  if (!offerQuery.data) {
    return (
      <EmptyState
        title="Offer not found"
        description="This offer may have been deleted or the link may be invalid."
        action={<BackToOffers />}
      />
    );
  }

  return <OfferForm key={offerQuery.data.id} initialOffer={offerQuery.data} />;
}
