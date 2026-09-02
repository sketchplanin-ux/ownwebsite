"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ExternalLink, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
  ImageUploader,
  type ImageUploaderImage,
} from "@/components/admin/image-uploader";
import { ResponsiveImage } from "@/components/website/responsive-image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getFirebaseErrorMessage } from "@/firebase/errors";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";
import { generateSlug } from "@/lib/slug";
import { isSafeHttpUrl } from "@/lib/url";
import type { Blog } from "@/types/blog";

import { AdminBlogConflictError } from "./api";
import { AdminBlogFormField } from "./form-field";
import { useCreateAdminBlog, useUpdateAdminBlog } from "./hooks";
import { RichTextEditor } from "./rich-text-editor";
import {
  blogFormSchema,
  blogFormValuesToInput,
  createBlogFormValues,
  EMPTY_TIPTAP_DOCUMENT,
  isTipTapDocument,
  type BlogFormValues,
} from "./schema";

interface BlogFormProps {
  initialBlog?: Blog;
}

function readableSaveError(error: unknown): string {
  if (error instanceof AdminBlogConflictError) {
    return error.message;
  }
  return getFirebaseErrorMessage(
    error,
    "The blog post could not be saved. Please try again.",
  );
}

export function BlogForm({ initialBlog }: BlogFormProps) {
  const router = useRouter();
  const admin = useAdmin();
  const createMutation = useCreateAdminBlog();
  const updateMutation = useUpdateAdminBlog();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialBlog),
  );
  const isEditing = Boolean(initialBlog);
  const defaultAuthor = admin.admin?.name || admin.admin?.email || "";
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: createBlogFormValues(initialBlog, defaultAuthor),
    mode: "onBlur",
  });
  const featuredImageUrl = useWatch({
    control: form.control,
    name: "featuredImageUrl",
  });
  const featuredImagePublicId = useWatch({
    control: form.control,
    name: "featuredImagePublicId",
  });
  const featuredImageAlt = useWatch({
    control: form.control,
    name: "featuredImageAlt",
  });
  const status = useWatch({ control: form.control, name: "status" });
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canManage = admin.can(PERMISSIONS.MANAGE_BLOGS);
  const fieldsDisabled = isSaving || !canManage;
  const titleRegistration = form.register("title");
  const slugRegistration = form.register("slug");
  const uploaderValue: ImageUploaderImage[] = isSafeHttpUrl(featuredImageUrl)
    ? [
        {
          url: featuredImageUrl,
          publicId: featuredImagePublicId || undefined,
          alt: featuredImageAlt,
        },
      ]
    : [];

  const submit: SubmitHandler<BlogFormValues> = async (values) => {
    if (!canManage) {
      form.setError("root", {
        message: "You no longer have permission to manage blog posts.",
      });
      return;
    }

    try {
      const input = blogFormValuesToInput(values);
      if (initialBlog) {
        await updateMutation.mutateAsync({
          blogId: initialBlog.id,
          existingPublishedAt: initialBlog.publishedAt,
          input,
        });
        toast.success("Blog post updated.");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Blog post created.");
      }
      router.push(ADMIN_ROUTES.blogs);
    } catch (error) {
      const message = readableSaveError(error);
      form.setError("root", { message });
      toast.error(message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Blogs / {isEditing ? "Edit" : "Create"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isEditing ? `Edit ${initialBlog?.title}` : "Create a blog post"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Write the article, add accessible media, control its lifecycle, and
            prepare search metadata.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" variant="outline">
            <Link href={ADMIN_ROUTES.blogs}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          {initialBlog ? (
            <Button asChild type="button" variant="outline">
              <Link
                href={`${ADMIN_ROUTES.blogs}preview/?id=${encodeURIComponent(initialBlog.id)}`}
              >
                <ExternalLink aria-hidden="true" />
                Preview
              </Link>
            </Button>
          ) : null}
          <Button type="submit" disabled={fieldsDisabled}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create post"}
          </Button>
        </div>
      </div>

      {form.formState.errors.root?.message ? (
        <Alert variant="destructive">
          <AlertTitle>Could not save blog post</AlertTitle>
          <AlertDescription>
            {form.formState.errors.root.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article details</CardTitle>
              <CardDescription>
                The title and summary readers see before opening the article.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <AdminBlogFormField
                htmlFor="blog-title"
                label="Title"
                required
                error={form.formState.errors.title?.message}
              >
                <Input
                  id="blog-title"
                  disabled={fieldsDisabled}
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
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-slug"
                label="Slug"
                required
                description="Editable. Used by the public blog detail URL."
                error={form.formState.errors.slug?.message}
              >
                <div className="flex gap-2">
                  <Input
                    id="blog-slug"
                    disabled={fieldsDisabled}
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
                    disabled={fieldsDisabled}
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
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-author"
                label="Author"
                required
                error={form.formState.errors.author?.message}
              >
                <Input
                  id="blog-author"
                  disabled={fieldsDisabled}
                  {...form.register("author")}
                  aria-invalid={Boolean(form.formState.errors.author)}
                />
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-category"
                label="Category"
                description="Optional free-text category."
                error={form.formState.errors.category?.message}
              >
                <Input
                  id="blog-category"
                  disabled={fieldsDisabled}
                  placeholder="Architecture insights"
                  {...form.register("category")}
                  aria-invalid={Boolean(form.formState.errors.category)}
                />
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-excerpt"
                label="Excerpt"
                required
                description="20–500 characters used on article cards and listings."
                error={form.formState.errors.excerpt?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="blog-excerpt"
                  rows={4}
                  disabled={fieldsDisabled}
                  {...form.register("excerpt")}
                  aria-invalid={Boolean(form.formState.errors.excerpt)}
                />
              </AdminBlogFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Article content</CardTitle>
              <CardDescription>
                Rich text is saved as structured TipTap JSON and rendered by the
                public article component.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="content"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <RichTextEditor
                      value={
                        isTipTapDocument(field.value)
                          ? field.value
                          : EMPTY_TIPTAP_DOCUMENT
                      }
                      disabled={fieldsDisabled}
                      error={Boolean(fieldState.error)}
                      onChange={(document) => field.onChange(document)}
                    />
                    {fieldState.error?.message ? (
                      <p role="alert" className="text-xs font-medium text-destructive">
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Featured image</CardTitle>
              <CardDescription>
                Upload one image and provide meaningful alt text.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ImageUploader
                className="sm:col-span-2"
                label="Upload featured image"
                description="Upload one JPG, PNG, or WebP. The secure URL and public ID are copied below."
                required
                maxCount={1}
                disabled={fieldsDisabled}
                value={uploaderValue}
                onChange={(images) => {
                  const image = images[0];
                  form.setValue("featuredImageUrl", image?.url ?? "", {
                    shouldDirty: true,
                    shouldValidate: Boolean(image),
                  });
                  form.setValue(
                    "featuredImagePublicId",
                    image?.publicId ?? "",
                    { shouldDirty: true },
                  );
                  if (!image) {
                    form.setValue("featuredImageAlt", "", { shouldDirty: true });
                  } else if (!form.getValues("featuredImageAlt").trim()) {
                    form.setValue("featuredImageAlt", image.alt, {
                      shouldDirty: true,
                    });
                  }
                }}
              />

              {isSafeHttpUrl(featuredImageUrl) ? (
                <div className="overflow-hidden rounded-xl border bg-muted sm:col-span-2">
                  <ResponsiveImage
                    src={featuredImageUrl}
                    alt={featuredImageAlt || "Featured image preview"}
                    className="max-h-96 w-full object-contain"
                  />
                </div>
              ) : null}

              <AdminBlogFormField
                htmlFor="featured-image-url"
                label="Image URL"
                required
                error={form.formState.errors.featuredImageUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="featured-image-url"
                  type="url"
                  disabled={fieldsDisabled}
                  placeholder="https://cdn.example.com/sketchplan/…"
                  {...form.register("featuredImageUrl")}
                  aria-invalid={Boolean(form.formState.errors.featuredImageUrl)}
                />
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="featured-image-public-id"
                label="Image object key"
                error={form.formState.errors.featuredImagePublicId?.message}
              >
                <Input
                  id="featured-image-public-id"
                  disabled={fieldsDisabled}
                  {...form.register("featuredImagePublicId")}
                />
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="featured-image-alt"
                label="Alt text"
                required
                error={form.formState.errors.featuredImageAlt?.message}
              >
                <Input
                  id="featured-image-alt"
                  disabled={fieldsDisabled}
                  {...form.register("featuredImageAlt")}
                  aria-invalid={Boolean(form.formState.errors.featuredImageAlt)}
                />
              </AdminBlogFormField>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                Choose whether this post is private, public, or retained as archived.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <AdminBlogFormField
                htmlFor="blog-status"
                label="Status"
                required
                error={form.formState.errors.status?.message}
              >
                <select
                  id="blog-status"
                  disabled={fieldsDisabled}
                  {...form.register("status")}
                  aria-invalid={Boolean(form.formState.errors.status)}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-published-at"
                label="Publication date"
                description={
                  status === "PUBLISHED"
                    ? "Leave blank to use the server time when first published."
                    : status === "DRAFT"
                      ? "Drafts do not retain a publication date when saved."
                      : "Archived posts retain their previous date unless changed."
                }
                error={form.formState.errors.publishedAt?.message}
              >
                <Input
                  id="blog-published-at"
                  type="datetime-local"
                  disabled={fieldsDisabled || status === "DRAFT"}
                  {...form.register("publishedAt")}
                  aria-invalid={Boolean(form.formState.errors.publishedAt)}
                />
              </AdminBlogFormField>

              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="text-xs text-muted-foreground">Current selection</p>
                <Badge variant="outline" className="mt-2">
                  {status === "DRAFT"
                    ? "Draft"
                    : status === "PUBLISHED"
                      ? "Published"
                      : "Archived"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Search metadata</CardTitle>
              <CardDescription>
                Optional overrides for search and social previews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <AdminBlogFormField
                htmlFor="blog-meta-title"
                label="SEO title"
                description="Up to 70 characters. The article title is used when blank."
                error={form.formState.errors.metaTitle?.message}
              >
                <Input
                  id="blog-meta-title"
                  disabled={fieldsDisabled}
                  {...form.register("metaTitle")}
                  aria-invalid={Boolean(form.formState.errors.metaTitle)}
                />
              </AdminBlogFormField>

              <AdminBlogFormField
                htmlFor="blog-meta-description"
                label="SEO description"
                description="Up to 200 characters. The excerpt is used when blank."
                error={form.formState.errors.metaDescription?.message}
              >
                <Textarea
                  id="blog-meta-description"
                  rows={5}
                  disabled={fieldsDisabled}
                  {...form.register("metaDescription")}
                  aria-invalid={Boolean(form.formState.errors.metaDescription)}
                />
              </AdminBlogFormField>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
