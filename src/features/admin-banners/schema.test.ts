import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import type { Banner } from "@/types/banner";

import { bannerFormValuesToInput, bannerToFormValues } from "./mappers";
import { bannerFormSchema, type BannerFormValues } from "./schema";

const VALID_BANNER: BannerFormValues = {
  title: "Summer studio showcase",
  subtitle: "Explore our newest residential work.",
  desktopImageUrl: "https://res.cloudinary.com/demo/banner.webp",
  desktopImagePublicId: "sketchplan/banner",
  desktopImageAlt: "Contemporary house exterior at sunset",
  mobileImageUrl: "https://res.cloudinary.com/demo/banner-mobile.webp",
  mobileImagePublicId: "sketchplan/banner-mobile",
  mobileImageAlt: "Contemporary house exterior",
  buttonText: "View projects",
  buttonUrl: "/projects/",
  startAt: "2030-06-01T09:00",
  endAt: "2030-06-30T18:00",
  active: true,
  displayOrder: 2,
};

describe("bannerFormSchema", () => {
  it("accepts a complete banner", () => {
    expect(bannerFormSchema.safeParse(VALID_BANNER).success).toBe(true);
  });

  it("requires an end date at or after the start date", () => {
    const result = bannerFormSchema.safeParse({
      ...VALID_BANNER,
      startAt: "2030-07-01T10:00",
      endAt: "2030-07-01T09:59",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "endAt"),
    ).toBe(true);
  });

  it("requires mobile alt text when mobile artwork is set", () => {
    const result = bannerFormSchema.safeParse({
      ...VALID_BANNER,
      mobileImageAlt: "",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "mobileImageAlt"),
    ).toBe(true);
  });

  it("requires button text and URL together", () => {
    const result = bannerFormSchema.safeParse({
      ...VALID_BANNER,
      buttonUrl: "",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "buttonUrl"),
    ).toBe(true);
  });
});

describe("banner mappers", () => {
  it("converts local schedule values to Firestore timestamps", () => {
    const input = bannerFormValuesToInput(VALID_BANNER);

    expect(input.startAt?.toDate().getTime()).toBe(
      new Date(VALID_BANNER.startAt).getTime(),
    );
    expect(input.endAt?.toDate().getTime()).toBe(
      new Date(VALID_BANNER.endAt).getTime(),
    );
  });

  it("maps stored timestamps back to datetime-local fields", () => {
    const createdAt = Timestamp.fromDate(new Date("2029-01-01T00:00:00Z"));
    const banner: Banner = {
      id: "banner-1",
      createdAt,
      updatedAt: createdAt,
      title: VALID_BANNER.title,
      desktopImageUrl: VALID_BANNER.desktopImageUrl,
      desktopImageAlt: VALID_BANNER.desktopImageAlt,
      startAt: Timestamp.fromDate(new Date(VALID_BANNER.startAt)),
      endAt: Timestamp.fromDate(new Date(VALID_BANNER.endAt)),
      active: true,
      displayOrder: 2,
    };

    const values = bannerToFormValues(banner);
    expect(new Date(values.startAt).getTime()).toBe(
      new Date(VALID_BANNER.startAt).getTime(),
    );
    expect(new Date(values.endAt).getTime()).toBe(
      new Date(VALID_BANNER.endAt).getTime(),
    );
  });
});
