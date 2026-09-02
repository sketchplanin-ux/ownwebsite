import {
  deleteField,
  doc,
  orderBy,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { COLLECTIONS } from "@/firebase/collections";
import { firestore } from "@/firebase/config";
import { logFirebaseError, mapFirebaseError } from "@/firebase/errors";
import {
  createDocument,
  readCollection,
  readDocument,
  removeDocument,
  updateDocument,
} from "@/firebase/firestore";
import type {
  Project,
  ProjectCategory,
  ProjectCategoryInput,
  ProjectInput,
} from "@/types/project";

type StoredProject = Omit<Project, "id">;
type StoredProjectCategory = Omit<ProjectCategory, "id">;

export const ADMIN_PROJECT_READ_LIMIT = 100;
export const ADMIN_CATEGORY_READ_LIMIT = 100;

export class AdminProjectConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminProjectConflictError";
  }
}

function normalizeDocumentId(value: string): string {
  const documentId = value.trim();
  if (!documentId || documentId.includes("/")) {
    throw new Error("The requested item identifier is invalid.");
  }
  return documentId;
}

export async function getAdminProjects(): Promise<Project[]> {
  return readCollection<StoredProject>(COLLECTIONS.projects, {
    constraints: [orderBy("updatedAt", "desc")],
    maxResults: ADMIN_PROJECT_READ_LIMIT,
  });
}

export async function getAdminProject(
  projectId: string,
): Promise<Project | null> {
  return readDocument<StoredProject>(
    COLLECTIONS.projects,
    normalizeDocumentId(projectId),
  );
}

export async function getAdminProjectCategories(): Promise<ProjectCategory[]> {
  return readCollection<StoredProjectCategory>(
    COLLECTIONS.projectCategories,
    {
      constraints: [orderBy("displayOrder", "asc")],
      maxResults: ADMIN_CATEGORY_READ_LIMIT,
    },
  );
}

async function projectSlugAvailable(
  slug: string,
  excludedProjectId?: string,
): Promise<boolean> {
  const matches = await readCollection<StoredProject>(COLLECTIONS.projects, {
    constraints: [where("slug", "==", slug)],
    maxResults: 2,
  });
  return matches.every((project) => project.id === excludedProjectId);
}

async function categorySlugAvailable(
  slug: string,
  excludedCategoryId?: string,
): Promise<boolean> {
  const matches = await readCollection<StoredProjectCategory>(
    COLLECTIONS.projectCategories,
    {
      constraints: [where("slug", "==", slug)],
      maxResults: 2,
    },
  );
  return matches.every((category) => category.id === excludedCategoryId);
}

export async function createAdminProject(input: ProjectInput): Promise<string> {
  if (!(await projectSlugAvailable(input.slug))) {
    throw new AdminProjectConflictError(
      "Another project already uses this slug. Choose a different slug.",
    );
  }
  return createDocument<ProjectInput>(COLLECTIONS.projects, input);
}

export async function updateAdminProject(
  projectId: string,
  input: ProjectInput,
): Promise<void> {
  const documentId = normalizeDocumentId(projectId);
  if (!(await projectSlugAvailable(input.slug, documentId))) {
    throw new AdminProjectConflictError(
      "Another project already uses this slug. Choose a different slug.",
    );
  }
  await updateDocument<StoredProject>(COLLECTIONS.projects, documentId, {
    ...input,
    ...(!input.completionDate ? { completionDate: deleteField() } : {}),
    ...(!input.coverImagePublicId
      ? { coverImagePublicId: deleteField() }
      : {}),
  });
}

export async function deleteAdminProject(projectId: string): Promise<void> {
  await removeDocument(COLLECTIONS.projects, normalizeDocumentId(projectId));
}

export async function createAdminProjectCategory(
  input: ProjectCategoryInput,
): Promise<string> {
  if (!(await categorySlugAvailable(input.slug))) {
    throw new AdminProjectConflictError(
      "Another category already uses this slug. Choose a different slug.",
    );
  }
  return createDocument<ProjectCategoryInput>(
    COLLECTIONS.projectCategories,
    input,
  );
}

export async function updateAdminProjectCategory(
  categoryId: string,
  input: ProjectCategoryInput,
): Promise<void> {
  const documentId = normalizeDocumentId(categoryId);
  if (!(await categorySlugAvailable(input.slug, documentId))) {
    throw new AdminProjectConflictError(
      "Another category already uses this slug. Choose a different slug.",
    );
  }
  const linkedProjects = await readCollection<StoredProject>(
    COLLECTIONS.projects,
    {
      constraints: [where("categoryId", "==", documentId)],
      maxResults: ADMIN_PROJECT_READ_LIMIT,
    },
  );

  try {
    const batch = writeBatch(firestore);
    batch.update(
      doc(firestore, COLLECTIONS.projectCategories, documentId),
      {
        ...input,
        updatedAt: serverTimestamp(),
      },
    );
    linkedProjects.forEach((project) => {
      if (project.category !== input.name) {
        batch.update(doc(firestore, COLLECTIONS.projects, project.id), {
          category: input.name,
          updatedAt: serverTimestamp(),
        });
      }
    });
    await batch.commit();
  } catch (error) {
    logFirebaseError("Update project category and linked projects", error);
    throw mapFirebaseError(
      error,
      "The category could not be updated. Please try again.",
    );
  }
}

export async function deleteAdminProjectCategory(
  categoryId: string,
): Promise<void> {
  await removeDocument(
    COLLECTIONS.projectCategories,
    normalizeDocumentId(categoryId),
  );
}
