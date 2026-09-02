import { Timestamp } from "firebase/firestore";

import { toDateTimeLocal } from "@/features/admin-banners/mappers";
import type { Offer, OfferInput } from "@/types/offer";

import type { OfferFormValues } from "./schema";

export function offerToFormValues(offer: Offer): OfferFormValues {
  return {
    title: offer.title,
    description: offer.description,
    imageUrl: offer.imageUrl ?? "",
    imagePublicId: offer.imagePublicId ?? "",
    imageAlt: offer.imageAlt ?? "",
    buttonText: offer.buttonText ?? "",
    buttonUrl: offer.buttonUrl ?? "",
    startAt: toDateTimeLocal(offer.startAt),
    endAt: toDateTimeLocal(offer.endAt),
    active: offer.active,
    showOnHomepage: offer.showOnHomepage,
    showAsPopup: offer.showAsPopup,
    displayOrder: offer.displayOrder,
  };
}

export function offerFormValuesToInput(values: OfferFormValues): OfferInput {
  const imageUrl = values.imageUrl.trim();
  const imagePublicId = values.imagePublicId.trim();
  const imageAlt = values.imageAlt.trim();
  const buttonText = values.buttonText.trim();
  const buttonUrl = values.buttonUrl.trim();

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    ...(imageUrl
      ? {
          imageUrl,
          ...(imagePublicId ? { imagePublicId } : {}),
          ...(imageAlt ? { imageAlt } : {}),
        }
      : {}),
    ...(buttonText ? { buttonText } : {}),
    ...(buttonUrl ? { buttonUrl } : {}),
    ...(values.startAt
      ? { startAt: Timestamp.fromDate(new Date(values.startAt)) }
      : {}),
    ...(values.endAt
      ? { endAt: Timestamp.fromDate(new Date(values.endAt)) }
      : {}),
    active: values.active,
    showOnHomepage: values.showOnHomepage,
    showAsPopup: values.showAsPopup,
    displayOrder: values.displayOrder,
  };
}
