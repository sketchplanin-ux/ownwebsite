"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  ImagePlus,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";

import {
  ImageUploader,
  type ImageUploaderImage,
} from "@/components/admin/image-uploader";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";
import { generateSlug } from "@/lib/slug";
import { isSafeHttpUrl } from "@/lib/url";
import type { Project, ProjectCategory } from "@/types/project";

import {
  useCreateAdminProject,
  useUpdateAdminProject,
} from "./hooks";
import { projectFormValuesToInput, projectToFormValues } from "./mappers";
import {
  EMPTY_PROJECT_FORM,
  projectFormSchema,
  type ProjectFormValues,
} from "./schema";
import { AdminFormField } from "./form-field";

interface ProjectFormProps {
  categories: readonly ProjectCategory[];
  initialProject?: Project;
}

function readableError(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "The project could not be saved. Please try again.";
}

export function ProjectForm({
  categories,
  initialProject,
}: ProjectFormProps) {
  const router = useRouter();
  const admin = useAdmin();
  const createMutation = useCreateAdminProject();
  const updateMutation = useUpdateAdminProject();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialProject),
  );
  const isEditing = Boolean(initialProject);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialProject
      ? projectToFormValues(initialProject, categories)
      : { ...EMPTY_PROJECT_FORM },
    mode: "onBlur",
  });
  const gallery = useFieldArray({
    control: form.control,
    name: "galleryImages",
  });
  const galleryValues = useWatch({
    control: form.control,
    name: "galleryImages",
  });
  const coverImageUrl = useWatch({
    control: form.control,
    name: "coverImageUrl",
  });
  const coverImageAlt = useWatch({
    control: form.control,
    name: "coverImageAlt",
  });
  const coverImagePublicId = useWatch({
    control: form.control,
    name: "coverImagePublicId",
  });
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canManage = admin.can(PERMISSIONS.MANAGE_PROJECTS);
  const titleRegistration = form.register("title");
  const slugRegistration = form.register("slug");
  const coverUploaderValue: ImageUploaderImage[] =
    coverImageUrl.startsWith("https://") && isSafeHttpUrl(coverImageUrl)
      ? [
          {
            url: coverImageUrl,
            publicId: coverImagePublicId || undefined,
            alt: coverImageAlt,
          },
        ]
      : [];
  const galleryUploaderValue: ImageUploaderImage[] = galleryValues.flatMap(
    (image) =>
      image.url.startsWith("https://") && isSafeHttpUrl(image.url)
        ? [
            {
              url: image.url,
              publicId: image.publicId || undefined,
              alt: image.alt,
            },
          ]
        : [],
  );

  const submit: SubmitHandler<ProjectFormValues> = async (values) => {
    if (!canManage) {
      form.setError("root", {
        message: "You no longer have permission to manage projects.",
      });
      return;
    }

    try {
      const input = projectFormValuesToInput(values, categories);
      if (initialProject) {
        await updateMutation.mutateAsync({
          projectId: initialProject.id,
          input,
        });
        toast.success("Project updated.");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Project created.");
      }
      router.push(ADMIN_ROUTES.projects);
    } catch (error) {
      const message = readableError(error);
      form.setError("root", { message });
      toast.error(message);
    }
  };

  const addGalleryImage = () => {
    gallery.append({
      url: "",
      publicId: "",
      alt: "",
      displayOrder: gallery.fields.length,
    });
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Projects / {isEditing ? "Edit" : "Create"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isEditing ? `Edit ${initialProject?.title}` : "Create a project"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Complete the project record, media metadata, publishing controls,
            and search metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" variant="outline">
            <Link href={ADMIN_ROUTES.projects}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          {initialProject ? (
            <Button asChild type="button" variant="outline">
              <Link
                href={`${ADMIN_ROUTES.projects}preview/?id=${encodeURIComponent(initialProject.id)}`}
              >
                <ExternalLink aria-hidden="true" />
                Preview
              </Link>
            </Button>
          ) : null}
          <Button type="submit" disabled={isSaving || !canManage}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create project"}
          </Button>
        </div>
      </div>

      {form.formState.errors.root?.message ? (
        <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project details</CardTitle>
              <CardDescription>
                Core public information and the project category.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <AdminFormField
                htmlFor="project-title"
                label="Title"
                required
                error={form.formState.errors.title?.message}
              >
                <Input
                  id="project-title"
                  {...titleRegistration}
                  onChange={(event) => {
                    void titleRegistration.onChange(event);
                    if (!slugManuallyEdited) {
                      form.setValue("slug", generateSlug(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: form.formState.isSubmitted,
                      });
                    }
                  }}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              </AdminFormField>

              <AdminFormField
                htmlFor="project-slug"
                label="Slug"
                required
                description="Editable. Used by the public project detail URL."
                error={form.formState.errors.slug?.message}
              >
                <div className="flex gap-2">
                  <Input
                    id="project-slug"
                    {...slugRegistration}
                    onChange={(event) => {
                      setSlugManuallyEdited(true);
                      void slugRegistration.onChange(event);
                    }}
                    aria-invalid={Boolean(form.formState.errors.slug)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Regenerate slug from title"
                    onClick={() => {
                      setSlugManuallyEdited(false);
                      form.setValue(
                        "slug",
                        generateSlug(form.getValues("title")),
                        { shouldDirty: true, shouldValidate: true },
                      );
                    }}
                  >
                    <RefreshCw aria-hidden="true" />
                  </Button>
                </div>
              </AdminFormField>

              <AdminFormField
                htmlFor="project-category"
                label="Category"
                required
                error={form.formState.errors.categoryId?.message}
              >
                <select
                  id="project-category"
                  {...form.register("categoryId")}
                  aria-invalid={Boolean(form.formState.errors.categoryId)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                      {category.published ? "" : " (unpublished)"}
                    </option>
                  ))}
                </select>
              </AdminFormField>

              <AdminFormField
                htmlFor="project-order"
                label="Display order"
                required
                error={form.formState.errors.displayOrder?.message}
              >
                <Input
                  id="project-order"
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  {...form.register("displayOrder", { valueAsNumber: true })}
                  aria-invalid={Boolean(form.formState.errors.displayOrder)}
                />
              </AdminFormField>

              <AdminFormField
                htmlFor="project-short-description"
                label="Short description"
                error={form.formState.errors.shortDescription?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="project-short-description"
                  rows={3}
                  {...form.register("shortDescription")}
                  aria-invalid={Boolean(form.formState.errors.shortDescription)}
                />
              </AdminFormField>

              <AdminFormField
                htmlFor="project-description"
                label="Full description"
                required
                error={form.formState.errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="project-description"
                  rows={10}
                  {...form.register("description")}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
              </AdminFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project information</CardTitle>
              <CardDescription>
                Optional context shown where applicable on the public website.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <AdminFormField
                htmlFor="project-location"
                label="Location"
                error={form.formState.errors.location?.message}
              >
                <Input id="project-location" {...form.register("location")} />
              </AdminFormField>
              <AdminFormField
                htmlFor="project-client"
                label="Client name"
                description="Leave blank if this should not be published."
                error={form.formState.errors.clientName?.message}
              >
                <Input id="project-client" {...form.register("clientName")} />
              </AdminFormField>
              <AdminFormField
                htmlFor="project-type"
                label="Project type"
                error={form.formState.errors.projectType?.message}
              >
                <Input id="project-type" {...form.register("projectType")} />
              </AdminFormField>
              <AdminFormField
                htmlFor="project-completion"
                label="Completion date"
                description="Stored as a date-only YYYY-MM-DD value."
                error={form.formState.errors.completionDate?.message}
              >
                <Input
                  id="project-completion"
                  type="date"
                  {...form.register("completionDate")}
                  aria-invalid={Boolean(form.formState.errors.completionDate)}
                />
              </AdminFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cover image</CardTitle>
              <CardDescription>
                Upload through the configured Cloudinary preset, or paste an
                existing secure URL and public ID.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ImageUploader
                className="sm:col-span-2"
                label="Upload cover image"
                description="Upload one JPG, PNG, or WebP to the configured Cloudinary account. The secure URL and public ID are copied into the fields below."
                required
                disabled={isSaving}
                value={coverUploaderValue}
                onChange={(images) => {
                  const image = images[0];
                  form.setValue("coverImageUrl", image?.url ?? "", {
                    shouldDirty: true,
                    shouldValidate: Boolean(image),
                  });
                  form.setValue(
                    "coverImagePublicId",
                    image?.publicId ?? "",
                    { shouldDirty: true },
                  );
                  if (!image) {
                    form.setValue("coverImageAlt", "", { shouldDirty: true });
                  }
                }}
              />
              {isSafeHttpUrl(coverImageUrl) ? (
                <div className="overflow-hidden rounded-xl border bg-muted sm:col-span-2">
                  <ResponsiveImage
                    src={coverImageUrl}
                    alt={coverImageAlt || "Cover image preview"}
                    className="max-h-80 w-full object-contain"
                  />
                </div>
              ) : null}
              <AdminFormField
                htmlFor="cover-image-url"
                label="Cloudinary HTTPS URL"
                required
                error={form.formState.errors.coverImageUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="cover-image-url"
                  type="url"
                  placeholder="https://res.cloudinary.com/…"
                  {...form.register("coverImageUrl")}
                  aria-invalid={Boolean(form.formState.errors.coverImageUrl)}
                />
              </AdminFormField>
              <AdminFormField
                htmlFor="cover-image-public-id"
                label="Cloudinary public ID"
                error={form.formState.errors.coverImagePublicId?.message}
              >
                <Input
                  id="cover-image-public-id"
                  {...form.register("coverImagePublicId")}
                />
              </AdminFormField>
              <AdminFormField
                htmlFor="cover-image-alt"
                label="Alt text"
                required
                error={form.formState.errors.coverImageAlt?.message}
              >
                <Input
                  id="cover-image-alt"
                  {...form.register("coverImageAlt")}
                  aria-invalid={Boolean(form.formState.errors.coverImageAlt)}
                />
              </AdminFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="grid-cols-[1fr_auto]">
              <div>
                <CardTitle>Project gallery</CardTitle>
                <CardDescription>
                  Add up to 30 images. Use the arrow controls to set their
                  public display order.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addGalleryImage}>
                <ImagePlus aria-hidden="true" />
                Add image
              </Button>
            </CardHeader>
            <CardContent>
              <ImageUploader
                className="mb-6"
                label="Upload gallery images"
                description="Upload up to 30 images to Cloudinary. Complete the alt text below, then use the arrow controls to refine display order."
                multiple
                maxCount={30}
                disabled={isSaving}
                value={galleryUploaderValue}
                onChange={(images) => {
                  const currentImages = form.getValues("galleryImages");
                  gallery.replace(
                    images.map((image, index) => {
                      const existing = currentImages.find(
                        (candidate) => candidate.url === image.url,
                      );
                      return {
                        url: image.url,
                        publicId: image.publicId ?? existing?.publicId ?? "",
                        alt: existing?.alt ?? image.alt,
                        displayOrder: index,
                      };
                    }),
                  );
                }}
              />
              {gallery.fields.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <p className="text-sm font-medium">No gallery images added.</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={addGalleryImage}
                  >
                    <Plus aria-hidden="true" />
                    Add the first image
                  </Button>
                </div>
              ) : (
                <ol className="space-y-4">
                  {gallery.fields.map((field, index) => {
                    const errors = form.formState.errors.galleryImages?.[index];
                    const imageUrl = galleryValues[index]?.url ?? "";
                    return (
                      <li key={field.id} className="rounded-xl border bg-muted/20 p-4">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="font-semibold">Image {index + 1}</p>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={index === 0}
                              aria-label={`Move image ${index + 1} earlier`}
                              onClick={() => gallery.move(index, index - 1)}
                            >
                              <ArrowUp aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-sm"
                              disabled={index === gallery.fields.length - 1}
                              aria-label={`Move image ${index + 1} later`}
                              onClick={() => gallery.move(index, index + 1)}
                            >
                              <ArrowDown aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon-sm"
                              aria-label={`Remove image ${index + 1}`}
                              onClick={() => gallery.remove(index)}
                            >
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </div>
                        </div>
                        <input
                          type="hidden"
                          value={index}
                          {...form.register(`galleryImages.${index}.displayOrder`, {
                            valueAsNumber: true,
                          })}
                        />
                        {isSafeHttpUrl(imageUrl) ? (
                          <div className="mb-4 overflow-hidden rounded-lg border bg-background">
                            <ResponsiveImage
                              src={imageUrl}
                              alt={galleryValues[index]?.alt || `Gallery image ${index + 1} preview`}
                              className="max-h-64 w-full object-contain"
                            />
                          </div>
                        ) : null}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <AdminFormField
                            htmlFor={`gallery-url-${field.id}`}
                            label="Cloudinary HTTPS URL"
                            required
                            error={errors?.url?.message}
                            className="sm:col-span-2"
                          >
                            <Input
                              id={`gallery-url-${field.id}`}
                              type="url"
                              placeholder="https://res.cloudinary.com/…"
                              {...form.register(`galleryImages.${index}.url`)}
                              aria-invalid={Boolean(errors?.url)}
                            />
                          </AdminFormField>
                          <AdminFormField
                            htmlFor={`gallery-public-id-${field.id}`}
                            label="Cloudinary public ID"
                            error={errors?.publicId?.message}
                          >
                            <Input
                              id={`gallery-public-id-${field.id}`}
                              {...form.register(`galleryImages.${index}.publicId`)}
                            />
                          </AdminFormField>
                          <AdminFormField
                            htmlFor={`gallery-alt-${field.id}`}
                            label="Alt text"
                            required
                            error={errors?.alt?.message}
                          >
                            <Input
                              id={`gallery-alt-${field.id}`}
                              {...form.register(`galleryImages.${index}.alt`)}
                              aria-invalid={Boolean(errors?.alt)}
                            />
                          </AdminFormField>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
              {form.formState.errors.galleryImages?.root?.message ? (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  {form.formState.errors.galleryImages.root.message}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search metadata</CardTitle>
              <CardDescription>
                Static-export detail pages use generic metadata; these fields
                remain available for content records and future generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <AdminFormField
                htmlFor="project-meta-title"
                label="Meta title"
                error={form.formState.errors.metaTitle?.message}
              >
                <Input id="project-meta-title" {...form.register("metaTitle")} />
              </AdminFormField>
              <AdminFormField
                htmlFor="project-meta-description"
                label="Meta description"
                error={form.formState.errors.metaDescription?.message}
              >
                <Textarea
                  id="project-meta-description"
                  rows={4}
                  {...form.register("metaDescription")}
                />
              </AdminFormField>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                Public pages only query published projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Controller
                control={form.control}
                name="published"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="project-published"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="project-published">Published</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Makes this project available to public project queries.
                      </p>
                    </div>
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="project-featured"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="project-featured">Featured</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Eligible for the featured projects section when published.
                      </p>
                    </div>
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {categories.length === 0 ? (
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle>No project categories</CardTitle>
                <CardDescription>
                  Create a category before saving a project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={ADMIN_ROUTES.projects}>Manage categories</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={isSaving || !canManage || categories.length === 0}
          >
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save project" : "Create project"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
