import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | SKETCHPLAN Admin",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

