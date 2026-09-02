"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { LoadingState } from "@/components/common/loading-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { generateSlug } from "@/lib/slug";
import type { Project, ProjectCategory } from "@/types/project";

import { AdminFormField } from "./form-field";
import {
  useAdminProjectCategories,
  useCreateAdminProjectCategory,
  useDeleteAdminProjectCategory,
  useUpdateAdminProjectCategory,
} from "./hooks";
import {
  projectCategoryFormValuesToInput,
  projectCategoryToFormValues,
} from "./mappers";
import {
  EMPTY_PROJECT_CATEGORY_FORM,
  projectCategoryFormSchema,
  type ProjectCategoryFormValues,
} from "./schema";

interface ProjectCategoryManagerProps {
  projects: readonly Project[];
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function ProjectCategoryManager({
  projects,
}: ProjectCategoryManagerProps) {
  const categoriesQuery = useAdminProjectCategories();
  const createMutation = useCreateAdminProjectCategory();
  const updateMutation = useUpdateAdminProjectCategory();
  const deleteMutation = useDeleteAdminProjectCategory();
  const [editingCategory, setEditingCategory] =
    useState<ProjectCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectCategory | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const form = useForm<ProjectCategoryFormValues>({
    resolver: zodResolver(projectCategoryFormSchema),
    defaultValues: { ...EMPTY_PROJECT_CATEGORY_FORM },
    mode: "onBlur",
  });
  const nameRegistration = form.register("name");
  const slugRegistration = form.register("slug");
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const resetForm = () => {
    setEditingCategory(null);
    setSlugManuallyEdited(false);
    form.reset({ ...EMPTY_PROJECT_CATEGORY_FORM });
  };

  const startEditing = (category: ProjectCategory) => {
    setEditingCategory(category);
    setSlugManuallyEdited(true);
    form.reset(projectCategoryToFormValues(category));
  };

  const submit: SubmitHandler<ProjectCategoryFormValues> = async (values) => {
    try {
      const input = projectCategoryFormValuesToInput(values);
      if (editingCategory) {
        await updateMutation.mutateAsync({
          categoryId: editingCategory.id,
          input,
        });
        toast.success("Project category updated.");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Project category created.");
      }
      resetForm();
    } catch (error) {
      const message = readableError(
        error,
        "The project category could not be saved.",
      );
      form.setError("root", { message });
      toast.error(message);
    }
  };

  const deleteCategory = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (editingCategory?.id === deleteTarget.id) {
        resetForm();
      }
      toast.success("Project category deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        readableError(error, "The project category could not be deleted."),
      );
    }
  };

  const categoryUsageCount = (category: ProjectCategory) =>
    projects.filter(
      (project) =>
        project.categoryId === category.id ||
        project.category.trim().toLocaleLowerCase("en-US") ===
          category.name.trim().toLocaleLowerCase("en-US"),
    ).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1.25fr)]">
      <Card className="xl:sticky xl:top-28 xl:self-start">
        <CardHeader>
          <CardTitle>
            {editingCategory ? "Edit category" : "Create category"}
          </CardTitle>
          <CardDescription>
            Categories populate the project editor and public portfolio filter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="space-y-5"
            noValidate
          >
            {form.formState.errors.root?.message ? (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}
            <AdminFormField
              htmlFor="category-name"
              label="Name"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                id="category-name"
                {...nameRegistration}
                onChange={(event) => {
                  void nameRegistration.onChange(event);
                  if (!slugManuallyEdited) {
                    form.setValue("slug", generateSlug(event.target.value), {
                      shouldDirty: true,
                      shouldValidate: form.formState.isSubmitted,
                    });
                  }
                }}
                aria-invalid={Boolean(form.formState.errors.name)}
              />
            </AdminFormField>

            <AdminFormField
              htmlFor="category-slug"
              label="Slug"
              required
              error={form.formState.errors.slug?.message}
            >
              <div className="flex gap-2">
                <Input
                  id="category-slug"
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
                  aria-label="Regenerate category slug"
                  onClick={() => {
                    setSlugManuallyEdited(false);
                    form.setValue(
                      "slug",
                      generateSlug(form.getValues("name")),
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
                >
                  <RefreshCw aria-hidden="true" />
                </Button>
              </div>
            </AdminFormField>

            <AdminFormField
              htmlFor="category-description"
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                id="category-description"
                rows={4}
                {...form.register("description")}
              />
            </AdminFormField>

            <AdminFormField
              htmlFor="category-order"
              label="Display order"
              required
              error={form.formState.errors.displayOrder?.message}
            >
              <Input
                id="category-order"
                type="number"
                min={0}
                max={9999}
                step={1}
                {...form.register("displayOrder", { valueAsNumber: true })}
                aria-invalid={Boolean(form.formState.errors.displayOrder)}
              />
            </AdminFormField>

            <Controller
              control={form.control}
              name="published"
              render={({ field }) => (
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Checkbox
                    id="category-published"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <div>
                    <Label htmlFor="category-published">Published</Label>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Makes this category available to public filters.
                    </p>
                  </div>
                </div>
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingCategory ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
                {isSaving
                  ? "Saving…"
                  : editingCategory
                    ? "Save category"
                    : "Create category"}
              </Button>
              {editingCategory ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X aria-hidden="true" />
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project categories</CardTitle>
          <CardDescription>
            Deleting a category does not delete projects; existing project
            records keep their stored category name until edited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isPending ? (
            <LoadingState message="Loading project categories…" />
          ) : null}
          {categoriesQuery.isError ? (
            <ErrorState
              title="Categories unavailable"
              description={categoriesQuery.error.message}
              onRetry={() => void categoriesQuery.refetch()}
            />
          ) : null}
          {categoriesQuery.isSuccess && categoriesQuery.data.length === 0 ? (
            <EmptyState
              title="No project categories"
              description="Use the form to create the first category."
            />
          ) : null}
          {categoriesQuery.data?.length ? (
            <ul className="divide-y">
              {categoriesQuery.data.map((category) => {
                const usageCount = categoryUsageCount(category);
                return (
                  <li
                    key={category.id}
                    className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{category.name}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase">
                          {category.published ? "Published" : "Hidden"}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        /{category.slug} · order {category.displayOrder} ·{" "}
                        {usageCount} {usageCount === 1 ? "project" : "projects"}
                      </p>
                      {category.description?.trim() ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(category)}
                      >
                        <Edit3 aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `“${deleteTarget.name}” will be removed. ${categoryUsageCount(deleteTarget)} linked project records will retain their current category text but should be reassigned.`
                : "This category will be removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void deleteCategory();
              }}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
