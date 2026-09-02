import {
  deleteField,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

import { COLLECTIONS, PAGE_DOCUMENTS, SETTINGS_DOCUMENTS } from "@/firebase/collections";
import { readDocument, setDocument } from "@/firebase/firestore";
import {
  getGeneralSettings,
  getSeoSettings,
  getSocialSettings,
} from "@/features/settings/api";
import type {
  AboutPageDocument,
  ContactPageDocument,
  HomePageDocument,
} from "@/types/page";
import type {
  GeneralSettings,
  SeoSettings,
  SocialSettings,
} from "@/types/settings";

export type GeneralSettingsInput = Omit<
  GeneralSettings,
  "id" | "updatedAt" | "logoPublicId" | "faviconPublicId"
>;
export type SocialSettingsInput = Omit<
  SocialSettings,
  "id" | "updatedAt"
>;
export type SeoSettingsInput = Omit<
  SeoSettings,
  "id" | "updatedAt" | "defaultOpenGraphImagePublicId"
>;

export type HomePageInput = Omit<
  HomePageDocument,
  "id" | "createdAt" | "updatedAt" | "introductionImage"
> & {
  introductionImage: HomePageDocument["introductionImage"] | null;
};
export type AboutPageInput = Omit<
  AboutPageDocument,
  "id" | "createdAt" | "updatedAt" | "heroImage"
> & {
  heroImage: AboutPageDocument["heroImage"] | null;
};
export type ContactPageInput = Omit<
  ContactPageDocument,
  "id" | "createdAt" | "updatedAt"
>;

export interface SettingsSaveRequest<TInput, TExisting> {
  values: TInput;
  previous: TExisting | null;
}

export interface PageSaveRequest<TInput> {
  values: TInput;
  isNew: boolean;
}

export {
  getGeneralSettings as getAdminGeneralSettings,
  getSeoSettings as getAdminSeoSettings,
  getSocialSettings as getAdminSocialSettings,
};

export async function saveGeneralSettings({
  values,
  previous,
}: SettingsSaveRequest<GeneralSettingsInput, GeneralSettings>): Promise<void> {
  const payload: DocumentData = { ...values };

  if (previous && previous.logoUrl !== values.logoUrl) {
    payload.logoPublicId = deleteField();
  }

  if (previous && previous.faviconUrl !== values.faviconUrl) {
    payload.faviconPublicId = deleteField();
  }

  await setDocument(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.general,
    payload,
  );
}

export async function saveSocialSettings({
  values,
}: SettingsSaveRequest<SocialSettingsInput, SocialSettings>): Promise<void> {
  await setDocument(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.social,
    values,
  );
}

export async function saveSeoSettings({
  values,
  previous,
}: SettingsSaveRequest<SeoSettingsInput, SeoSettings>): Promise<void> {
  const payload: DocumentData = { ...values };

  if (
    previous &&
    previous.defaultOpenGraphImageUrl !== values.defaultOpenGraphImageUrl
  ) {
    payload.defaultOpenGraphImagePublicId = deleteField();
  }

  await setDocument(
    COLLECTIONS.siteSettings,
    SETTINGS_DOCUMENTS.seo,
    payload,
  );
}

async function getAdminPage<TPage extends { id: string }>(
  documentId: string,
): Promise<TPage | null> {
  const page = await readDocument<Omit<TPage, "id">>(
    COLLECTIONS.pages,
    documentId,
  );

  return page ? ({ ...page, id: documentId } as TPage) : null;
}

export function getAdminHomePage(): Promise<HomePageDocument | null> {
  return getAdminPage<HomePageDocument>(PAGE_DOCUMENTS.home);
}

export function getAdminAboutPage(): Promise<AboutPageDocument | null> {
  return getAdminPage<AboutPageDocument>(PAGE_DOCUMENTS.about);
}

export function getAdminContactPage(): Promise<ContactPageDocument | null> {
  return getAdminPage<ContactPageDocument>(PAGE_DOCUMENTS.contact);
}

function createPagePayload(
  values: DocumentData,
  isNew: boolean,
): DocumentData {
  return {
    ...values,
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };
}

export async function saveHomePage({
  values,
  isNew,
}: PageSaveRequest<HomePageInput>): Promise<void> {
  const { introductionImage, ...content } = values;
  const payload = createPagePayload(
    {
      ...content,
      ...(introductionImage
        ? { introductionImage }
        : isNew
          ? {}
          : { introductionImage: deleteField() }),
    },
    isNew,
  );

  await setDocument(COLLECTIONS.pages, PAGE_DOCUMENTS.home, payload);
}

export async function saveAboutPage({
  values,
  isNew,
}: PageSaveRequest<AboutPageInput>): Promise<void> {
  const { heroImage, ...content } = values;
  const payload = createPagePayload(
    {
      ...content,
      ...(heroImage
        ? { heroImage }
        : isNew
          ? {}
          : { heroImage: deleteField() }),
    },
    isNew,
  );

  await setDocument(COLLECTIONS.pages, PAGE_DOCUMENTS.about, payload);
}

export async function saveContactPage({
  values,
  isNew,
}: PageSaveRequest<ContactPageInput>): Promise<void> {
  await setDocument(
    COLLECTIONS.pages,
    PAGE_DOCUMENTS.contact,
    createPagePayload(values, isNew),
  );
}
