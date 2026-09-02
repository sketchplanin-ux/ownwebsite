import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[70svh] flex-1 items-center overflow-hidden px-6 py-24 sm:px-10 lg:px-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-y-0 left-[12%] w-px bg-border/70" />
        <div className="absolute inset-y-0 right-[18%] w-px bg-border/50" />
        <div className="absolute top-[20%] right-0 left-0 h-px bg-border/60" />
        <div className="absolute right-[18%] bottom-[18%] size-36 border border-border/60 sm:size-56" />
      </div>

      <section
        aria-labelledby="not-found-title"
        className="mx-auto w-full max-w-5xl"
      >
        <p className="font-mono text-xs font-semibold tracking-[0.32em] text-primary uppercase">
          Error 404
        </p>
        <h1
          id="not-found-title"
          className="mt-5 max-w-3xl text-5xl leading-[0.98] font-medium text-balance sm:text-7xl lg:text-8xl"
        >
          This page is off the plan.
        </h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
          The address may have changed, or the page may no longer exist. Return
          to the studio homepage or continue through our project portfolio.
        </p>

        <nav
          aria-label="Page recovery"
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Return home
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View projects
          </Link>
        </nav>
      </section>
    </main>
  );
}
