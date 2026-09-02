import type { Metadata } from "next";

import { OffersAdminScreen } from "@/features/admin-offers/offers-admin-screen";

export const metadata: Metadata = {
  title: "Offers",
};

export default function AdminOffersPage() {
  return <OffersAdminScreen />;
}
