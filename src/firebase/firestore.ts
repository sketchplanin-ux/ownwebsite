import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  type DocumentData,
  type FieldValue,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type SetOptions,
  type UpdateData,
  type WithFieldValue,
} from "firebase/firestore";

import {
  documentSnapshotToData,
  queryDocumentSnapshotToData,
  type WithDocumentId,
} from "@/firebase/converters";
import { firestore } from "@/firebase/config";
import { logFirebaseError, mapFirebaseError } from "@/firebase/errors";

const DEFAULT_QUERY_LIMIT = 50;
const MAX_QUERY_LIMIT = 100;

function safeLimit(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(MAX_QUERY_LIMIT, Math.max(1, Math.floor(value)));
}

async function runFirestoreOperation<T>(
  context: string,
  fallbackMessage: string,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logFirebaseError(context, error);
    throw mapFirebaseError(error, fallbackMessage);
  }
}

export interface ReadCollectionOptions {
  constraints?: readonly QueryConstraint[];
  maxResults?: number;
}

export interface PaginationOptions {
  constraints?: readonly QueryConstraint[];
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface PaginatedResult<T> {
  items: WithDocumentId<T>[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export function withCreateTimestamps<T extends DocumentData>(
  data: T,
): T & { createdAt: FieldValue; updatedAt: FieldValue } {
  return {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function withUpdateTimestamp<T extends DocumentData>(
  data: T,
): T & { updatedAt: FieldValue } {
  return {
    ...data,
    updatedAt: serverTimestamp(),
  };
}

export async function readDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
): Promise<WithDocumentId<T> | null> {
  return runFirestoreOperation(
    `Read ${collectionName}/${documentId}`,
    "Unable to load the requested item. Please try again.",
    async () => {
      const snapshot = await getDoc(
        doc(firestore, collectionName, documentId),
      );
      return documentSnapshotToData<T>(snapshot);
    },
  );
}

export async function readCollection<T extends DocumentData>(
  collectionName: string,
  options: ReadCollectionOptions = {},
): Promise<WithDocumentId<T>[]> {
  return runFirestoreOperation(
    `Read ${collectionName} collection`,
    "Unable to load this content. Please try again.",
    async () => {
      const collectionQuery = query(
        collection(firestore, collectionName),
        ...(options.constraints ?? []),
        limit(safeLimit(options.maxResults, DEFAULT_QUERY_LIMIT)),
      );
      const snapshot = await getDocs(collectionQuery);
      return snapshot.docs.map((item) =>
        queryDocumentSnapshotToData<T>(item),
      );
    },
  );
}

export async function readPaginatedCollection<T extends DocumentData>(
  collectionName: string,
  options: PaginationOptions = {},
): Promise<PaginatedResult<T>> {
  return runFirestoreOperation(
    `Read paginated ${collectionName} collection`,
    "Unable to load this page of content. Please try again.",
    async () => {
      const pageSize = safeLimit(options.pageSize, 20);
      const paginationConstraints: QueryConstraint[] = [
        ...(options.constraints ?? []),
      ];

      if (options.cursor) {
        paginationConstraints.push(startAfter(options.cursor));
      }

      paginationConstraints.push(limit(pageSize + 1));

      const snapshot = await getDocs(
        query(collection(firestore, collectionName), ...paginationConstraints),
      );
      const hasMore = snapshot.docs.length > pageSize;
      const visibleDocuments = snapshot.docs.slice(0, pageSize);

      return {
        items: visibleDocuments.map((item) =>
          queryDocumentSnapshotToData<T>(item),
        ),
        nextCursor: hasMore
          ? (visibleDocuments.at(-1) ?? null)
          : null,
        hasMore,
      };
    },
  );
}

export async function createDocument<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>,
): Promise<string> {
  return runFirestoreOperation(
    `Create ${collectionName} document`,
    "Unable to save this item. Please try again.",
    async () => {
      const reference = await addDoc(
        collection(firestore, collectionName),
        withCreateTimestamps(data),
      );
      return reference.id;
    },
  );
}

export async function setDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: WithFieldValue<T>,
  options: SetOptions = { merge: true },
): Promise<void> {
  return runFirestoreOperation(
    `Set ${collectionName}/${documentId}`,
    "Unable to save this item. Please try again.",
    async () => {
      await setDoc(
        doc(firestore, collectionName, documentId),
        withUpdateTimestamp(data),
        options,
      );
    },
  );
}

export async function updateDocument<T extends DocumentData>(
  collectionName: string,
  documentId: string,
  data: UpdateData<T>,
): Promise<void> {
  return runFirestoreOperation(
    `Update ${collectionName}/${documentId}`,
    "Unable to update this item. Please try again.",
    async () => {
      await updateDoc(doc(firestore, collectionName, documentId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
  );
}

export async function removeDocument(
  collectionName: string,
  documentId: string,
): Promise<void> {
  return runFirestoreOperation(
    `Delete ${collectionName}/${documentId}`,
    "Unable to delete this item. Please try again.",
    async () => {
      await deleteDoc(doc(firestore, collectionName, documentId));
    },
  );
}

