import type { Metadata } from "next";

import { OfferCreateScreen } from "@/features/admin-offers/offer-create-screen";

export const metadata: Metadata = {
  title: "Create Offer",
};

export default function AdminOfferCreatePage() {
  return <OfferCreateScreen />;
}
