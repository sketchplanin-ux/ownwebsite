"use client";

import { Toaster } from "sonner";

import { QueryProvider } from "@/providers/query-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster closeButton position="top-right" richColors />
    </QueryProvider>
  );
}
