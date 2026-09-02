import type {
  AuditedDocument,
  DateOnlyString,
  DisplayOrdered,
  Publishable,
  SeoFields,
} from "./common";
import type { OrderedMediaImage } from "./media";

export type ProjectImage = OrderedMediaImage;

export interface Project
  extends AuditedDocument,
    DisplayOrdered,
    Publishable,
    SeoFields {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: string;
  categoryId?: string;
  location?: string;
  clientName?: string;
  projectType?: string;
  completionDate?: DateOnlyString;
  coverImageUrl: string;
  coverImagePublicId?: string;
  coverImageAlt: string;
  galleryImages: ProjectImage[];
  featured: boolean;
}

export interface ProjectCategory
  extends AuditedDocument,
    DisplayOrdered,
    Publishable {
  name: string;
  slug: string;
  description?: string;
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;

export type ProjectCategoryInput = Omit<
  ProjectCategory,
  "id" | "createdAt" | "updatedAt"
>;
