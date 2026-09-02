/**
 * The subset of Firebase's `Timestamp` API used by the application.
 *
 * Keeping this structural means real Firestore `Timestamp` instances are
 * assignable without coupling every domain type to the Firebase SDK.
 */
export interface FirestoreTimestamp {
  readonly seconds: number;
  readonly nanoseconds: number;
  toDate(): Date;
}

export type DateOnlyString = `${number}-${number}-${number}`;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface CreatedDocument {
  id: string;
  createdAt: FirestoreTimestamp;
}

export interface AuditedDocument extends CreatedDocument {
  updatedAt: FirestoreTimestamp;
}

export interface SeoFields {
  metaTitle?: string;
  metaDescription?: string;
}

export interface Publishable {
  published: boolean;
}

export interface DisplayOrdered {
  displayOrder: number;
}

export type CreateDocumentInput<T extends AuditedDocument> = Omit<
  T,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateDocumentInput<T extends AuditedDocument> = Partial<
  Omit<T, "id" | "createdAt" | "updatedAt">
>;
