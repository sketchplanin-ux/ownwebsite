import type {
  DocumentData,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export type WithDocumentId<T> = T & { id: string };

export function documentSnapshotToData<T extends DocumentData>(
  snapshot: DocumentSnapshot<DocumentData>,
): WithDocumentId<T> | null {
  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as T),
    id: snapshot.id,
  };
}

export function queryDocumentSnapshotToData<T extends DocumentData>(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): WithDocumentId<T> {
  return {
    ...(snapshot.data() as T),
    id: snapshot.id,
  };
}

