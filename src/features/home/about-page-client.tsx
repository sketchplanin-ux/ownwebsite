"use client";

import { ArrowUpRight, Award, Eye, Target, Users } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { SectionHeading } from "@/components/website/section-heading";
import { DEFAULT_ABOUT_CONTENT } from "@/features/home/defaults";
import { useAboutPage } from "@/features/pages/hooks";
import { PUBLIC_ROUTES } from "@/lib/constants";
import {
  isSafeHttpUrl,
  isSafeRelativeUrl,
  sanitizeLinkUrl,
} from "@/lib/url";

const SECTION_CONTAINER =
  "mx-auto w-full max-w-screen-2xl px-6 sm:px-10 lg:px-14";

function isUsableImage(value: string | undefined): value is string {
  const source = value?.trim();
  return Boolean(
    source && (isSafeHttpUrl(source) || isSafeRelativeUrl(source)),
  );
}

function ordered<T extends { displayOrder: number }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) => {
    const firstOrder = Number.isFinite(first.displayOrder)
      ? first.displayOrder
      : Number.MAX_SAFE_INTEGER;
    const secondOrder = Number.isFinite(second.displayOrder)
      ? second.displayOrder
      : Number.MAX_SAFE_INTEGER;
    return firstOrder - secondOrder;
  });
}

export function AboutPageClient() {
  const query = useAboutPage();
  const page = query.data;
  const teamMembers = ordered(
    page?.teamMembers?.length
      ? page.teamMembers
      : DEFAULT_ABOUT_CONTENT.teamMembers,
  );
  const processSteps = ordered(
    page?.processSteps?.length
      ? page.processSteps
      : DEFAULT_ABOUT_CONTENT.processSteps,
  );
  const whyChooseItems = ordered(
    page?.whyChooseItems?.length
      ? page.whyChooseItems
      : DEFAULT_ABOUT_CONTENT.whyChooseItems,
  );
  const awards = ordered(page?.awards ?? DEFAULT_ABOUT_CONTENT.awards);
  const heroImage = page?.heroImage;
  const cta =
    page?.contactCallToAction ?? DEFAULT_ABOUT_CONTENT.contactCallToAction;
  const ctaHref = sanitizeLinkUrl(cta.buttonUrl) ?? PUBLIC_ROUTES.contact;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-foreground text-background">
        {heroImage && isUsableImage(heroImage.imageUrl) ? (
          <>
            <ResponsiveImage
              src={heroImage.imageUrl}
              alt={heroImage.imageAlt?.trim() || "About SKETCHPLAN"}
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              widths={[640, 960, 1280, 1600, 1920]}
              className="absolute inset-0 size-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 opacity-25">
            <span className="absolute top-[15%] right-[8%] h-[62%] w-[38%] border border-background/50" />
            <span className="absolute top-[27%] right-[17%] h-[62%] w-[38%] border border-background/30" />
            <span className="absolute right-[2%] bottom-[13%] h-px w-[66%] bg-background/35" />
          </div>
        )}
        <div className={`${SECTION_CONTAINER} relative flex min-h-[32rem] items-end py-20 sm:min-h-[36rem] lg:py-28`}>
          <div className="max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.25em] text-background/60 uppercase">
              About the studio
            </p>
            <h1 className="mt-5 text-5xl leading-none font-semibold text-background sm:text-6xl lg:text-7xl">
              {page?.title?.trim() || "About SKETCHPLAN"}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-background/70 sm:text-lg">
              {page?.introduction?.trim() || DEFAULT_ABOUT_CONTENT.introduction}
            </p>
          </div>
        </div>
      </section>

      {query.isPending ? (
        <div
          role="status"
          aria-live="polite"
          className="border-b border-border bg-muted px-6 py-3 text-center text-xs text-muted-foreground"
        >
          Loading the latest studio profile…
        </div>
      ) : null}
      {query.isError ? (
        <div
          role="alert"
          className="border-b border-border bg-muted px-6 py-3 text-center text-xs text-muted-foreground"
        >
          Managed About content is temporarily unavailable. Verified core
          information is shown below.{" "}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="rounded-sm font-semibold text-foreground underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="bg-background py-20 sm:py-24 lg:py-32">
        <div className={`${SECTION_CONTAINER} grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20`}>
          <SectionHeading
            eyebrow="Who we are"
            title="Architecture, interiors, and planning in one conversation"
          />
          <div>
            <p className="text-xl leading-9 text-foreground sm:text-2xl sm:leading-10">
              {page?.introduction?.trim() || DEFAULT_ABOUT_CONTENT.introduction}
            </p>
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              {page?.experience?.trim() || DEFAULT_ABOUT_CONTENT.experience}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24 lg:py-28">
        <div className={`${SECTION_CONTAINER} grid gap-6 lg:grid-cols-2`}>
          <article className="rounded-2xl border bg-card p-8 shadow-architectural sm:p-10">
            <Target aria-hidden="true" className="size-7 text-primary" />
            <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Mission
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Purpose in every decision</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {page?.mission?.trim() || DEFAULT_ABOUT_CONTENT.mission}
            </p>
          </article>
          <article className="rounded-2xl border bg-card p-8 shadow-architectural sm:p-10">
            <Eye aria-hidden="true" className="size-7 text-primary" />
            <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Vision
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Spaces with lasting relevance</h2>
            <p className="mt-5 text-base leading-8 text-muted-foreground">
              {page?.vision?.trim() || DEFAULT_ABOUT_CONTENT.vision}
            </p>
          </article>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24 lg:py-28">
        <div className={SECTION_CONTAINER}>
          <SectionHeading
            eyebrow="Experience"
            title="A multidisciplinary point of view"
            description={page?.experience?.trim() || DEFAULT_ABOUT_CONTENT.experience}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="border-t border-border pt-6">
              <h3 className="text-2xl font-semibold">Architecture</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Buildings and spaces developed around context, use, and clear
                spatial organization.
              </p>
            </article>
            <article className="border-t border-border pt-6">
              <h3 className="text-2xl font-semibold">Interior design</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Interior environments considered through movement, material,
                light, and everyday experience.
              </p>
            </article>
            <article className="border-t border-border pt-6">
              <h3 className="text-2xl font-semibold">Planning</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Requirements organized into purposeful layouts and a practical
                path forward.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-foreground py-20 text-background sm:py-24 lg:py-28">
        <div className={SECTION_CONTAINER}>
          <SectionHeading
            eyebrow="People"
            title={page?.teamHeading?.trim() || DEFAULT_ABOUT_CONTENT.teamHeading}
            description="The named studio contacts provided for SKETCHPLAN."
            className="[&_h2]:text-background [&_p]:text-background/60"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-2xl border border-background/15 bg-background/5"
              >
                {isUsableImage(member.imageUrl) ? (
                  <ResponsiveImage
                    src={member.imageUrl}
                    alt={member.imageAlt?.trim() || member.name}
                    sizes="(min-width: 768px) 33vw, 100vw"
                    widths={[320, 480, 640, 800]}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-background/5">
                    <Users aria-hidden="true" className="size-10 text-background/30" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-background">
                    {member.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-background/60">
                    {member.role}
                  </p>
                  {member.bio?.trim() ? (
                    <p className="mt-4 text-sm leading-7 text-background/60">
                      {member.bio}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24 lg:py-28">
        <div className={SECTION_CONTAINER}>
          <SectionHeading
            eyebrow="Process"
            title={
              page?.processHeading?.trim() || DEFAULT_ABOUT_CONTENT.processHeading
            }
            description="A clear sequence connects early questions to increasingly resolved design decisions."
          />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <li key={step.id} className="border-t border-border pt-6">
                <span className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24 lg:py-28">
        <div className={SECTION_CONTAINER}>
          <SectionHeading
            eyebrow="Why SKETCHPLAN"
            title={
              page?.whyChooseHeading?.trim() ||
              DEFAULT_ABOUT_CONTENT.whyChooseHeading
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {whyChooseItems.map((item, index) => (
              <article key={item.id} className="rounded-2xl border bg-card p-7">
                <span className="text-xs font-semibold tracking-[0.2em] text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-20 sm:py-24 lg:py-28">
        <div className={SECTION_CONTAINER}>
          <SectionHeading
            eyebrow="Recognition"
            title={page?.awardsHeading?.trim() || DEFAULT_ABOUT_CONTENT.awardsHeading}
            description="Only awards and certifications published by the studio are presented here."
            className="mb-10"
          />
          {awards.length === 0 ? (
            <EmptyState
              title="No awards or certifications published"
              description="Verified recognition will appear here when the studio adds it."
              icon={<Award />}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {awards.map((award) => (
                <article
                  key={award.id}
                  className="overflow-hidden rounded-2xl border bg-card"
                >
                  {isUsableImage(award.imageUrl) ? (
                    <ResponsiveImage
                      src={award.imageUrl}
                      alt={award.imageAlt?.trim() || award.title}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      widths={[320, 480, 640, 800]}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold">{award.title}</h3>
                    {award.issuer?.trim() || award.year?.trim() ? (
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {[award.issuer?.trim(), award.year?.trim()]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                    {award.description?.trim() ? (
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {award.description}
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground sm:py-24">
        <div className={`${SECTION_CONTAINER} flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end`}>
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-primary-foreground/60 uppercase">
              Work with SKETCHPLAN
            </p>
            <h2 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">
              {cta.heading?.trim() ||
                DEFAULT_ABOUT_CONTENT.contactCallToAction.heading}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/70">
              {cta.description?.trim() ||
                DEFAULT_ABOUT_CONTENT.contactCallToAction.description}
            </p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-sm bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            {cta.buttonText?.trim() ||
              DEFAULT_ABOUT_CONTENT.contactCallToAction.buttonText}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
