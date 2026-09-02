import { COLLECTIONS, PAGE_DOCUMENTS } from "@/firebase/collections";
import { readDocument } from "@/firebase/firestore";
import type {
  AboutPageDocument,
  ContactPageDocument,
  HomePageDocument,
} from "@/types/page";

async function readPublishedPage<TPage extends { id: string; published: boolean }>(
  documentId: string,
): Promise<TPage | null> {
  const page = await readDocument<Omit<TPage, "id">>(
    COLLECTIONS.pages,
    documentId,
  );

  if (!page?.published) {
    return null;
  }

  return { ...page, id: documentId } as TPage;
}

export function getHomePage(): Promise<HomePageDocument | null> {
  return readPublishedPage<HomePageDocument>(PAGE_DOCUMENTS.home);
}

export function getAboutPage(): Promise<AboutPageDocument | null> {
  return readPublishedPage<AboutPageDocument>(PAGE_DOCUMENTS.about);
}

export function getContactPage(): Promise<ContactPageDocument | null> {
  return readPublishedPage<ContactPageDocument>(PAGE_DOCUMENTS.contact);
}
