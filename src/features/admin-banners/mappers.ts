import { Timestamp } from "firebase/firestore";

import { toDate } from "@/lib/date";
import type { Banner, BannerInput } from "@/types/banner";

import type { BannerFormValues } from "./schema";

export function toDateTimeLocal(value: unknown): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function bannerToFormValues(banner: Banner): BannerFormValues {
  return {
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    desktopImageUrl: banner.desktopImageUrl,
    desktopImagePublicId: banner.desktopImagePublicId ?? "",
    desktopImageAlt: banner.desktopImageAlt,
    mobileImageUrl: banner.mobileImageUrl ?? "",
    mobileImagePublicId: banner.mobileImagePublicId ?? "",
    mobileImageAlt: banner.mobileImageAlt ?? "",
    buttonText: banner.buttonText ?? "",
    buttonUrl: banner.buttonUrl ?? "",
    startAt: toDateTimeLocal(banner.startAt),
    endAt: toDateTimeLocal(banner.endAt),
    active: banner.active,
    displayOrder: banner.displayOrder,
  };
}

export function bannerFormValuesToInput(
  values: BannerFormValues,
): BannerInput {
  const subtitle = values.subtitle.trim();
  const desktopImagePublicId = values.desktopImagePublicId.trim();
  const mobileImageUrl = values.mobileImageUrl.trim();
  const mobileImagePublicId = values.mobileImagePublicId.trim();
  const mobileImageAlt = values.mobileImageAlt.trim();
  const buttonText = values.buttonText.trim();
  const buttonUrl = values.buttonUrl.trim();

  return {
    title: values.title.trim(),
    ...(subtitle ? { subtitle } : {}),
    desktopImageUrl: values.desktopImageUrl.trim(),
    ...(desktopImagePublicId ? { desktopImagePublicId } : {}),
    desktopImageAlt: values.desktopImageAlt.trim(),
    ...(mobileImageUrl
      ? {
          mobileImageUrl,
          ...(mobileImagePublicId ? { mobileImagePublicId } : {}),
          ...(mobileImageAlt ? { mobileImageAlt } : {}),
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
    displayOrder: values.displayOrder,
  };
}
