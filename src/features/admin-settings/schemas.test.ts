import { describe, expect, it } from "vitest";

import {
  generalSettingsFormSchema,
  homePageFormSchema,
  pageFeatureListSchema,
  parseStructuredJson,
  socialSettingsFormSchema,
} from "@/features/admin-settings/schemas";

const validGeneralSettings = {
  companyName: "SKETCHPLAN",
  logoUrl: "/brand/sketchplan-mark.png",
  logoAlt: "SKETCHPLAN logo",
  faviconUrl: "/favicon.ico",
  phone: "",
  whatsappNumber: "",
  email: "sketchplan.amc@gmail.com",
  address: "",
  googleMapsUrl: "",
  officeHours: "",
  footerText: "Architecture, Interior & Planning",
  brandAccentColor: "#9A6B42",
};

describe("admin settings schemas", () => {
  it("accepts safe relative assets and a hexadecimal accent color", () => {
    expect(generalSettingsFormSchema.safeParse(validGeneralSettings).success).toBe(
      true,
    );
  });

  it("rejects unsafe asset protocols", () => {
    const result = generalSettingsFormSchema.safeParse({
      ...validGeneralSettings,
      logoUrl: "javascript:alert(1)",
    });

    expect(result.success).toBe(false);
  });

  it("allows omitted social profiles but rejects non-http profile URLs", () => {
    expect(
      socialSettingsFormSchema.safeParse({
        facebookUrl: "",
        instagramUrl: "",
        linkedInUrl: "",
        youtubeUrl: "",
        whatsappUrl: "",
      }).success,
    ).toBe(true);
    expect(
      socialSettingsFormSchema.safeParse({
        facebookUrl: "ftp://example.com/profile",
        instagramUrl: "",
        linkedInUrl: "",
        youtubeUrl: "",
        whatsappUrl: "",
      }).success,
    ).toBe(false);
  });
});

describe("managed page structured content", () => {
  const featureJson = JSON.stringify([
    {
      id: "clear-process",
      title: "Clear process",
      description: "A coordinated sequence of design decisions.",
      displayOrder: 1,
    },
  ]);

  it("parses validated repeatable sections", () => {
    expect(parseStructuredJson(featureJson, pageFeatureListSchema)).toHaveLength(
      1,
    );
  });

  it("rejects malformed structured JSON in the page form", () => {
    const result = homePageFormSchema.safeParse({
      title: "Home",
      published: false,
      metaTitle: "",
      metaDescription: "",
      introductionHeading: "Design with clarity",
      introductionBody: "A connected architecture and interiors practice.",
      introductionImageUrl: "",
      introductionImageAlt: "",
      whyChooseHeading: "Why choose us",
      whyChooseItemsJson: "not-json",
      processHeading: "Our process",
      processStepsJson: "[]",
      contactCallToAction: {
        heading: "Start a conversation",
        description: "Tell us about your project.",
        buttonText: "Contact us",
        buttonUrl: "/contact/",
      },
    });

    expect(result.success).toBe(false);
  });
});

