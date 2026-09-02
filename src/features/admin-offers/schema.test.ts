import { Timestamp } from "firebase/firestore";
import { describe, expect, it } from "vitest";

import type { Offer } from "@/types/offer";

import { offerFormValuesToInput, offerToFormValues } from "./mappers";
import { offerFormSchema, type OfferFormValues } from "./schema";

const VALID_OFFER: OfferFormValues = {
  title: "Design consultation",
  description: "Book a limited introductory consultation with our studio.",
  imageUrl: "https://cdn.test.example/sketchplan/offer.webp",
  imagePublicId: "sketchplan/offer",
  imageAlt: "Architect reviewing a floor plan",
  buttonText: "Contact us",
  buttonUrl: "/contact/",
  startAt: "2030-08-01T09:00",
  endAt: "2030-08-31T18:00",
  active: true,
  showOnHomepage: true,
  showAsPopup: false,
  displayOrder: 1,
};

describe("offerFormSchema", () => {
  it("accepts a complete offer", () => {
    expect(offerFormSchema.safeParse(VALID_OFFER).success).toBe(true);
  });

  it("allows an offer without optional image, action, or schedule", () => {
    const result = offerFormSchema.safeParse({
      ...VALID_OFFER,
      imageUrl: "",
      imagePublicId: "",
      imageAlt: "",
      buttonText: "",
      buttonUrl: "",
      startAt: "",
      endAt: "",
    });

    expect(result.success).toBe(true);
  });

  it("requires an end date at or after the start date", () => {
    const result = offerFormSchema.safeParse({
      ...VALID_OFFER,
      startAt: "2030-09-01T10:00",
      endAt: "2030-09-01T09:59",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "endAt"),
    ).toBe(true);
  });

  it("requires image alt text when artwork is set", () => {
    const result = offerFormSchema.safeParse({
      ...VALID_OFFER,
      imageAlt: "",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "imageAlt"),
    ).toBe(true);
  });

  it("requires button text and URL together", () => {
    const result = offerFormSchema.safeParse({
      ...VALID_OFFER,
      buttonText: "",
    });

    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some((issue) => issue.path[0] === "buttonText"),
    ).toBe(true);
  });
});

describe("offer mappers", () => {
  it("converts local schedule values to Firestore timestamps", () => {
    const input = offerFormValuesToInput(VALID_OFFER);

    expect(input.startAt?.toDate().getTime()).toBe(
      new Date(VALID_OFFER.startAt).getTime(),
    );
    expect(input.endAt?.toDate().getTime()).toBe(
      new Date(VALID_OFFER.endAt).getTime(),
    );
  });

  it("omits cleared optional image fields from writes", () => {
    const input = offerFormValuesToInput({
      ...VALID_OFFER,
      imageUrl: "",
      imagePublicId: "",
      imageAlt: "",
    });

    expect(input).not.toHaveProperty("imageUrl");
    expect(input).not.toHaveProperty("imagePublicId");
    expect(input).not.toHaveProperty("imageAlt");
  });

  it("maps stored placement and schedule values to the form", () => {
    const createdAt = Timestamp.fromDate(new Date("2029-01-01T00:00:00Z"));
    const offer: Offer = {
      id: "offer-1",
      createdAt,
      updatedAt: createdAt,
      title: VALID_OFFER.title,
      description: VALID_OFFER.description,
      startAt: Timestamp.fromDate(new Date(VALID_OFFER.startAt)),
      endAt: Timestamp.fromDate(new Date(VALID_OFFER.endAt)),
      active: true,
      showOnHomepage: true,
      showAsPopup: true,
      displayOrder: 1,
    };

    const values = offerToFormValues(offer);
    expect(values.showOnHomepage).toBe(true);
    expect(values.showAsPopup).toBe(true);
    expect(new Date(values.startAt).getTime()).toBe(
      new Date(VALID_OFFER.startAt).getTime(),
    );
  });
});
