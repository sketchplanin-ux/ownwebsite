import { ArrowLeftIcon, ShieldCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AdminBrand } from "@/components/admin/admin-brand";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Secure sign in for authorized SKETCHPLAN administrators.",
};

function LoginFormFallback() {
  return (
    <div
      aria-label="Loading admin sign in"
      className="w-full max-w-md space-y-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
      role="status"
    >
      <Skeleton className="size-11 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <span className="sr-only">Loading sign-in form&hellip;</span>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_45%,transparent)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom_right,black,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -top-28 right-[-8rem] -z-10 size-96 rounded-full bg-brand-soft blur-3xl"
      />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)]">
        <section className="hidden border-r bg-foreground px-12 py-10 text-background lg:flex lg:flex-col">
          <AdminBrand tone="inverse" />
          <div className="my-auto max-w-lg py-16">
            <p className="font-mono text-xs font-medium tracking-[0.2em] text-background/60 uppercase">
              Architecture · Interior · Planning
            </p>
            <h1 className="mt-6 font-heading text-5xl leading-[1.08] font-semibold tracking-tight">
              Your studio&apos;s work, organized in one place.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-background/65">
              Manage projects, editorial content, promotions, enquiries, and
              site settings through the SKETCHPLAN control studio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-background/55">
            <ShieldCheckIcon aria-hidden="true" className="size-4" />
            Firebase-secured administrator access
          </div>
        </section>

        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-14 lg:py-10">
          <div className="flex items-center justify-between gap-4">
            <AdminBrand className="lg:hidden" />
            <Link
              href="/"
              className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              Back to website
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-12">
            <Suspense fallback={<LoginFormFallback />}>
              <LoginForm />
            </Suspense>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} SKETCHPLAN. Authorized personnel only.
          </p>
        </section>
      </div>
    </main>
  );
}

