"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";

export default function AdminIndexPage() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    router.replace(
      auth.isAuthenticated ? "/admin/dashboard" : "/admin/login",
    );
  }, [auth.isAuthenticated, auth.isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-6">
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 text-sm text-muted-foreground"
      >
        <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
        Opening the admin area&hellip;
      </div>
    </main>
  );
}

