"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import { GoogleMap } from "@/components/website/google-map";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { SectionHeading } from "@/components/website/section-heading";
import { Skeleton } from "@/components/ui/skeleton";
import { BannerCarousel } from "@/features/banners/banner-carousel";
import { useActiveBanners } from "@/features/banners/hooks";
import { BlogCard } from "@/features/blogs/blog-card";
import { useLatestBlogs } from "@/features/blogs/hooks";
import { DEFAULT_HOME_CONTENT } from "@/features/home/defaults";
import { OfferPopup } from "@/features/offers/offer-popup";
import { useActiveOffers } from "@/features/offers/hooks";
import { useHomePage } from "@/features/pages/hooks";
import { ProjectCard } from "@/features/projects";
import { useFeaturedProjects } from "@/features/projects/hooks";
import { ServiceCard } from "@/features/services";
import { useFeaturedServices } from "@/features/services/hooks";
import { DEFAULT_GENERAL_SETTINGS } from "@/features/settings/defaults";
import { useGeneralSettings } from "@/features/settings/hooks";
import { formatDate } from "@/lib/date";
import { PUBLIC_ROUTES } from "@/lib/constants";
import {
  isSafeGoogleMapsEmbedUrl,
  isSafeHttpUrl,
  isSafeRelativeUrl,
  sanitizeLinkUrl,
} from "@/lib/url";
import type { CallToAction } from "@/types/page";
import type { Offer } from "@/types/offer";

const SECTION_CONTAINER =
  "mx-auto w-full max-w-screen-2xl px-6 sm:px-10 lg:px-14";

function isUsableImage(value: string | undefined): value is string {
  const source = value?.trim();
  return Boolean(
    source && (isSafeHttpUrl(source) || isSafeRelativeUrl(source)),
  );
}

function sortedByDisplayOrder<T extends { displayOrder: number }>(
  items: readonly T[],
): T[] {
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

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-10 items-center gap-2 rounded-sm text-sm font-semibold text-foreground outline-none underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

function CardsLoading({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading content" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading published content…</span>
    </div>
  );
}

function FallbackHero({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <section className="relative isolate min-h-[38rem] overflow-hidden bg-foreground text-white lg:min-h-[43rem]">
      <ResponsiveImage
        src="/images/architecture-concept-hero.webp"
        alt="Conceptual architectural model and planning study"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover object-[62%_center] sm:object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/20" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[72%] bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
      <div className={`${SECTION_CONTAINER} relative flex min-h-[38rem] items-end py-20 lg:min-h-[43rem] lg:py-28`}>
        <div className="max-w-4xl">
          <p className="mb-5 font-mono text-[0.65rem] font-semibold tracking-[0.26em] text-white/60 uppercase">
            SP / Architecture · Interior · Planning
          </p>
          <h1 className="max-w-full text-[2.5rem] leading-[0.94] font-semibold tracking-[-0.045em] text-white [overflow-wrap:anywhere] sm:max-w-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem]">
            Spaces considered as a complete whole.
          </h1>
          <p className="mt-7 max-w-xl border-l border-white/35 pl-5 text-sm leading-7 text-white/70 sm:text-lg sm:leading-8">
            SKETCHPLAN connects architecture, interior design, and planning in
            one focused design process.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={PUBLIC_ROUTES.projects}
              className="inline-flex min-h-12 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-background"
            >
              View projects
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href={PUBLIC_ROUTES.contact}
              className="inline-flex min-h-12 items-center rounded-sm border border-white/45 px-5 py-3 text-sm font-semibold text-white outline-none transition-colors hover:bg-white hover:text-foreground focus-visible:ring-2 focus-visible:ring-white"
            >
              Start a conversation
            </Link>
          </div>
          {isLoading ? (
            <p className="sr-only" role="status" aria-live="polite">
              Loading active homepage banners.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function IntroductionSection() {
  const { data: homePage, isError, refetch } = useHomePage();
  const heading =
    homePage?.introductionHeading?.trim() ||
    DEFAULT_HOME_CONTENT.introductionHeading;
  const body =
    homePage?.introductionBody?.trim() || DEFAULT_HOME_CONTENT.introductionBody;
  const image = homePage?.introductionImage;

  return (
    <section className="bg-background py-20 sm:py-24 lg:py-32">
      <div className={`${SECTION_CONTAINER} grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20`}>
        <div>
          <SectionHeading
            eyebrow="The studio"
            title={heading}
            description={body}
          />
          <SectionLink href={PUBLIC_ROUTES.about} label="Meet SKETCHPLAN" />
          {isError ? (
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 block rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Managed introduction unavailable. Retry
            </button>
          ) : null}
        </div>
        {image && isUsableImage(image.imageUrl) ? (
          <div className="relative overflow-hidden rounded-2xl bg-muted shadow-architectural">
            <ResponsiveImage
              src={image.imageUrl}
              alt={image.imageAlt?.trim() || "SKETCHPLAN design work"}
              sizes="(min-width: 1024px) 45vw, 100vw"
              widths={[480, 640, 800, 960, 1280]}
              className="aspect-[5/4] w-full object-cover"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="relative aspect-[5/4] overflow-hidden rounded-2xl border bg-surface shadow-architectural"
          >
            <span className="absolute top-[12%] left-[12%] h-[58%] w-[58%] border border-foreground/30" />
            <span className="absolute right-[12%] bottom-[12%] h-[58%] w-[58%] bg-primary/10 ring-1 ring-primary/30" />
            <span className="absolute top-[22%] right-[22%] h-[56%] w-px bg-foreground/25" />
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturedServicesSection() {
  const query = useFeaturedServices(3);

  return (
    <section className="bg-surface py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Capabilities"
            title="Featured services"
            description="Architecture, interior design, and planning services published by the studio."
          />
          <SectionLink href={PUBLIC_ROUTES.services} label="All services" />
        </div>
        {query.isPending ? <CardsLoading /> : null}
        {query.isError ? (
          <ErrorState
            title="Services are temporarily unavailable"
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data?.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {query.data.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
        {query.isSuccess && query.data.length === 0 ? (
          <EmptyState
            title="Services are being prepared"
            description="Published service details will appear here when available."
            icon={<Building2 />}
          />
        ) : null}
      </div>
    </section>
  );
}

function FeaturedProjectsSection() {
  const query = useFeaturedProjects(6);

  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Featured projects"
            description="A selection of published architecture, interior, and planning work."
          />
          <SectionLink href={PUBLIC_ROUTES.projects} label="Explore projects" />
        </div>
        {query.isPending ? <CardsLoading count={3} /> : null}
        {query.isError ? (
          <ErrorState
            title="Projects are temporarily unavailable"
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data?.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {query.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
        {query.isSuccess && query.data.length === 0 ? (
          <EmptyState
            title="The project selection is being curated"
            description="Featured published projects will appear here when available."
          />
        ) : null}
      </div>
    </section>
  );
}

function WhyChooseSection() {
  const { data: homePage } = useHomePage();
  const items = sortedByDisplayOrder(
    homePage?.whyChooseItems?.length
      ? homePage.whyChooseItems
      : DEFAULT_HOME_CONTENT.whyChooseItems,
  );
  const heading =
    homePage?.whyChooseHeading?.trim() || DEFAULT_HOME_CONTENT.whyChooseHeading;

  return (
    <section className="bg-foreground py-20 text-background sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <SectionHeading
          eyebrow="The approach"
          title={heading}
          className="[&_h2]:text-background [&_p]:text-background/60"
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-background/15 bg-background/15 md:grid-cols-3">
          {items.map((item, index) => (
            <article key={item.id} className="bg-foreground p-7 sm:p-9">
              <p className="text-xs font-semibold tracking-[0.2em] text-background/45">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-12 text-2xl font-semibold text-background">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-background/65">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const { data: homePage } = useHomePage();
  const steps = sortedByDisplayOrder(
    homePage?.processSteps?.length
      ? homePage.processSteps
      : DEFAULT_HOME_CONTENT.processSteps,
  );
  const heading =
    homePage?.processHeading?.trim() || DEFAULT_HOME_CONTENT.processHeading;

  return (
    <section className="bg-surface py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <SectionHeading
          eyebrow="From brief to detail"
          title={heading}
          description="A structured sequence keeps ideas, decisions, and practical requirements aligned."
        />
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.id} className="relative border-t border-border pt-6">
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
  );
}

function OfferSection({ offer }: { offer: Offer | null }) {
  if (!offer) {
    return (
      <EmptyState
        title="No current promotion"
        description="Seasonal offers will be shown here when the studio publishes one."
      />
    );
  }

  const buttonUrl = offer.buttonUrl
    ? sanitizeLinkUrl(offer.buttonUrl)
    : null;

  return (
    <article className="grid overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-architectural lg:grid-cols-[0.85fr_1.15fr]">
      {isUsableImage(offer.imageUrl) ? (
        <ResponsiveImage
          src={offer.imageUrl}
          alt={offer.imageAlt?.trim() || offer.title}
          sizes="(min-width: 1024px) 42vw, 100vw"
          widths={[480, 640, 800, 960, 1280]}
          className="h-full min-h-72 w-full object-cover"
        />
      ) : (
        <div aria-hidden="true" className="relative min-h-64 bg-foreground/15">
          <span className="absolute inset-[14%] border border-primary-foreground/30" />
          <span className="absolute top-[28%] right-[8%] h-px w-[68%] bg-primary-foreground/30" />
        </div>
      )}
      <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
        <p className="text-xs font-semibold tracking-[0.22em] text-primary-foreground/65 uppercase">
          Current offer
        </p>
        <h3 className="mt-4 text-3xl font-semibold sm:text-4xl">{offer.title}</h3>
        <p className="mt-5 max-w-2xl text-base leading-7 text-primary-foreground/75">
          {offer.description}
        </p>
        {offer.endAt ? (
          <p className="mt-4 inline-flex items-center gap-2 text-sm text-primary-foreground/65">
            <CalendarDays aria-hidden="true" className="size-4" />
            Available through {formatDate(offer.endAt)}
          </p>
        ) : null}
        {buttonUrl && offer.buttonText?.trim() ? (
          <Link
            href={buttonUrl}
            className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-sm bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary-foreground"
          >
            {offer.buttonText}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function CurrentOfferSection() {
  const query = useActiveOffers();
  const homepageOffer =
    query.data?.find((offer) => offer.showOnHomepage !== false) ?? null;
  const popupOffer = query.data?.find((offer) => offer.showAsPopup) ?? null;

  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <SectionHeading
          eyebrow="From the studio"
          title="Current promotion"
          className="mb-10"
        />
        {query.isPending ? (
          <LoadingState message="Checking current offers…" variant="panel" />
        ) : null}
        {query.isError ? (
          <ErrorState
            title="Offers are temporarily unavailable"
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess ? <OfferSection offer={homepageOffer} /> : null}
      </div>
      <OfferPopup offer={popupOffer} />
    </section>
  );
}

function LatestBlogsSection() {
  const query = useLatestBlogs(3);

  return (
    <section className="bg-surface py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Ideas & guidance"
            title="Latest from the blog"
            description="Published notes on architecture, interiors, planning, and the decisions that shape space."
          />
          <SectionLink href={PUBLIC_ROUTES.blog} label="All articles" />
        </div>
        {query.isPending ? <CardsLoading /> : null}
        {query.isError ? (
          <ErrorState
            title="Articles are temporarily unavailable"
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.data?.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {query.data.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : null}
        {query.isSuccess && query.data.length === 0 ? (
          <EmptyState
            title="No articles published yet"
            description="The latest published studio articles will appear here."
          />
        ) : null}
      </div>
    </section>
  );
}

function ContactCallToAction() {
  const { data: homePage } = useHomePage();
  const cta: CallToAction =
    homePage?.contactCallToAction ?? DEFAULT_HOME_CONTENT.contactCallToAction;
  const href = sanitizeLinkUrl(cta.buttonUrl) ?? PUBLIC_ROUTES.contact;

  return (
    <section className="bg-foreground py-20 text-background sm:py-24">
      <div className={`${SECTION_CONTAINER} flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end`}>
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] text-background/55 uppercase">
            Start a conversation
          </p>
          <h2 className="mt-4 text-4xl leading-tight font-semibold sm:text-5xl">
            {cta.heading?.trim() || DEFAULT_HOME_CONTENT.contactCallToAction.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-background/65">
            {cta.description?.trim() ||
              DEFAULT_HOME_CONTENT.contactCallToAction.description}
          </p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-sm bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-background"
        >
          {cta.buttonText?.trim() || DEFAULT_HOME_CONTENT.contactCallToAction.buttonText}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </section>
  );
}

function MapSection() {
  const query = useGeneralSettings();
  const settings = query.data ?? DEFAULT_GENERAL_SETTINGS;
  const hasMap = isSafeGoogleMapsEmbedUrl(settings.googleMapsUrl);

  return (
    <section className="bg-background py-20 sm:py-24 lg:py-28">
      <div className={SECTION_CONTAINER}>
        <SectionHeading
          eyebrow="Location"
          title="Find SKETCHPLAN"
          description={
            settings.address?.trim()
              ? settings.address
              : "The studio map will appear here when a verified location is published."
          }
          className="mb-10"
        />
        {query.isPending ? (
          <LoadingState message="Loading location details…" variant="panel" />
        ) : null}
        {query.isError ? (
          <ErrorState
            title="Location details are temporarily unavailable"
            onRetry={() => void query.refetch()}
          />
        ) : null}
        {query.isSuccess && hasMap ? (
          <GoogleMap
            embedUrl={settings.googleMapsUrl}
            title={`${settings.companyName || "SKETCHPLAN"} studio location`}
            className="min-h-[26rem] rounded-2xl shadow-architectural"
          />
        ) : null}
        {query.isSuccess && !hasMap ? (
          <EmptyState
            title="Location map not published"
            description="Please use the Contact page to get in touch with the studio."
            icon={<MapPin />}
            action={<SectionLink href={PUBLIC_ROUTES.contact} label="Contact SKETCHPLAN" />}
          />
        ) : null}
      </div>
    </section>
  );
}

export function HomePageClient() {
  const bannerQuery = useActiveBanners();

  return (
    <>
      {bannerQuery.data?.length ? (
        <BannerCarousel banners={bannerQuery.data} />
      ) : (
        <FallbackHero isLoading={bannerQuery.isPending} />
      )}
      {bannerQuery.isError ? (
        <div role="status" className="bg-muted px-6 py-3 text-center text-xs text-muted-foreground">
          Active banners could not be loaded. Core homepage content is shown instead.
        </div>
      ) : null}
      <IntroductionSection />
      <FeaturedServicesSection />
      <FeaturedProjectsSection />
      <WhyChooseSection />
      <ProcessSection />
      <CurrentOfferSection />
      <LatestBlogsSection />
      <ContactCallToAction />
      <MapSection />
    </>
  );
}
