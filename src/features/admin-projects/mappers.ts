import type { DateOnlyString } from "@/types/common";
import type {
  Project,
  ProjectCategory,
  ProjectCategoryInput,
  ProjectInput,
} from "@/types/project";

import type {
  ProjectCategoryFormValues,
  ProjectFormValues,
} from "./schema";

function byDisplayOrder<T extends { displayOrder: number }>(
  first: T,
  second: T,
): number {
  return first.displayOrder - second.displayOrder;
}

export function projectToFormValues(
  project: Project,
  categories: readonly ProjectCategory[],
): ProjectFormValues {
  const categoryId =
    project.categoryId?.trim() ||
    categories.find(
      (category) =>
        category.name.trim().toLocaleLowerCase("en-US") ===
        project.category.trim().toLocaleLowerCase("en-US"),
    )?.id ||
    "";

  return {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription ?? "",
    description: project.description,
    categoryId,
    location: project.location ?? "",
    clientName: project.clientName ?? "",
    projectType: project.projectType ?? "",
    completionDate: project.completionDate ?? "",
    coverImageUrl: project.coverImageUrl,
    coverImagePublicId: project.coverImagePublicId ?? "",
    coverImageAlt: project.coverImageAlt,
    galleryImages: [...project.galleryImages]
      .sort(byDisplayOrder)
      .map((image, index) => ({
        url: image.url,
        publicId: image.publicId ?? "",
        alt: image.alt,
        displayOrder: index,
      })),
    featured: project.featured,
    published: project.published,
    displayOrder: project.displayOrder,
    metaTitle: project.metaTitle ?? "",
    metaDescription: project.metaDescription ?? "",
  };
}

export function projectFormValuesToInput(
  values: ProjectFormValues,
  categories: readonly ProjectCategory[],
): ProjectInput {
  const category = categories.find((item) => item.id === values.categoryId);
  if (!category) {
    throw new Error("Select an available project category.");
  }

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    category: category.name.trim(),
    categoryId: category.id,
    location: values.location.trim(),
    clientName: values.clientName.trim(),
    projectType: values.projectType.trim(),
    ...(values.completionDate
      ? { completionDate: values.completionDate as DateOnlyString }
      : {}),
    coverImageUrl: values.coverImageUrl.trim(),
    ...(values.coverImagePublicId.trim()
      ? { coverImagePublicId: values.coverImagePublicId.trim() }
      : {}),
    coverImageAlt: values.coverImageAlt.trim(),
    galleryImages: values.galleryImages.map((image, index) => ({
      url: image.url.trim(),
      ...(image.publicId.trim()
        ? { publicId: image.publicId.trim() }
        : {}),
      alt: image.alt.trim(),
      displayOrder: index,
    })),
    featured: values.featured,
    published: values.published,
    displayOrder: values.displayOrder,
    metaTitle: values.metaTitle.trim(),
    metaDescription: values.metaDescription.trim(),
  };
}

export function projectCategoryToFormValues(
  category: ProjectCategory,
): ProjectCategoryFormValues {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    displayOrder: category.displayOrder,
    published: category.published,
  };
}

export function projectCategoryFormValuesToInput(
  values: ProjectCategoryFormValues,
): ProjectCategoryInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    displayOrder: values.displayOrder,
    published: values.published,
  };
}
