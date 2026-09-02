"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { Permission } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";

interface AdminRouteGuardProps {
  children: ReactNode;
  permissions?: Permission | readonly Permission[];
  permissionMode?: "all" | "any";
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
  loginPath?: string;
}

function StatusMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section
        aria-labelledby="admin-access-title"
        className="w-full max-w-lg rounded-lg border bg-background p-8 text-center shadow-sm"
      >
        <h1 id="admin-access-title" className="text-2xl font-semibold">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <a
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md border px-4 text-sm font-medium"
          href="/admin/login/"
        >
          Return to admin sign in
        </a>
      </section>
    </main>
  );
}

export function AdminRouteGuard({
  children,
  permissions,
  permissionMode = "all",
  loadingFallback,
  unauthorizedFallback,
  loginPath = "/admin/login",
}: AdminRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const admin = useAdmin();

  useEffect(() => {
    if (admin.status !== "unauthenticated") {
      return;
    }

    const returnTo = pathname?.startsWith("/admin") ? pathname : "/admin";
    router.replace(`${loginPath}?returnTo=${encodeURIComponent(returnTo)}`);
  }, [admin.status, loginPath, pathname, router]);

  if (admin.isLoading || admin.status === "unauthenticated") {
    return (
      loadingFallback ?? (
        <div
          aria-live="polite"
          className="flex min-h-screen items-center justify-center p-6 text-sm text-muted-foreground"
          role="status"
        >
          Verifying admin access&hellip;
        </div>
      )
    );
  }

  if (admin.status === "inactive") {
    return (
      unauthorizedFallback ?? (
        <StatusMessage
          title="Account inactive"
          message={
            admin.error ??
            "This admin account is inactive. Contact a super administrator for help."
          }
        />
      )
    );
  }

  if (admin.status === "unauthorized") {
    return (
      unauthorizedFallback ?? (
        <StatusMessage
          title="Admin access required"
          message={
            admin.error ??
            "This account is not authorized to access the admin area."
          }
        />
      )
    );
  }

  if (admin.status === "error") {
    return (
      unauthorizedFallback ?? (
        <StatusMessage
          title="Unable to verify access"
          message={
            admin.error ??
            "We could not verify your admin access. Please try again."
          }
        />
      )
    );
  }

  if (!admin.isAuthenticated || !admin.adminUser) {
    return null;
  }

  if (permissions) {
    const requiredPermissions = Array.isArray(permissions)
      ? permissions
      : [permissions];
    const allowed =
      permissionMode === "any"
        ? admin.canAny(requiredPermissions)
        : admin.canAll(requiredPermissions);

    if (!allowed) {
      return (
        unauthorizedFallback ?? (
          <StatusMessage
            title="Permission required"
            message="Your role does not have permission to view this page."
          />
        )
      );
    }
  }

  return children;
}

