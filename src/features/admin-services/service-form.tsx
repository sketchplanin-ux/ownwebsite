"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";

import { ImageUploader } from "@/components/admin/image-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ServiceFormField } from "@/features/admin-services/form-field";
import {
  createServiceFormValues,
  serviceFormSchema,
  toServiceInput,
  type ServiceFormValues,
} from "@/features/admin-services/schema";
import { slugify } from "@/lib/slug";
import type { Service, ServiceInput } from "@/types/service";

export interface ServiceFormProps {
  error?: Error | null;
  initialService?: Service | null;
  isPending?: boolean;
  onSubmit: (input: ServiceInput) => Promise<void>;
  submitLabel: string;
}

export function ServiceForm({
  error,
  initialService,
  isPending = false,
  onSubmit,
  submitLabel,
}: ServiceFormProps) {
  const [manualSlug, setManualSlug] = useState(Boolean(initialService));
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: createServiceFormValues(initialService),
  });
  const features = useFieldArray({ control: form.control, name: "features" });
  const title = useWatch({ control: form.control, name: "title" });
  const published = useWatch({ control: form.control, name: "published" });
  const featured = useWatch({ control: form.control, name: "featured" });

  useEffect(() => {
    if (!manualSlug) {
      form.setValue("slug", slugify(title ?? ""), {
        shouldDirty: Boolean(title),
        shouldValidate: Boolean(title),
      });
    }
  }, [form, manualSlug, title]);

  const submit = async (values: ServiceFormValues) => {
    await onSubmit(toServiceInput(values));
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Service could not be saved</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.7fr)]">
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Service content</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ServiceFormField htmlFor="service-title" label="Title" required error={form.formState.errors.title?.message}>
                <Input id="service-title" autoFocus disabled={isPending} {...form.register("title")} />
              </ServiceFormField>
              <ServiceFormField
                htmlFor="service-slug"
                label="URL slug"
                required
                error={form.formState.errors.slug?.message}
                description="Lowercase words separated by hyphens. Existing public links depend on this value."
              >
                <div className="flex gap-2">
                  <Input
                    id="service-slug"
                    disabled={isPending}
                    {...form.register("slug", {
                      onChange: () => { setManualSlug(true); },
                    })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isPending}
                    aria-label="Regenerate slug from title"
                    onClick={() => {
                      setManualSlug(false);
                      form.setValue("slug", slugify(form.getValues("title")), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  >
                    <RefreshCw aria-hidden="true" />
                  </Button>
                </div>
              </ServiceFormField>
              <ServiceFormField htmlFor="service-short" label="Short description" required error={form.formState.errors.shortDescription?.message}>
                <Textarea id="service-short" rows={4} disabled={isPending} {...form.register("shortDescription")} />
              </ServiceFormField>
              <ServiceFormField htmlFor="service-description" label="Full description" required error={form.formState.errors.description?.message}>
                <Textarea id="service-description" rows={12} disabled={isPending} {...form.register("description")} />
              </ServiceFormField>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Service image</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <Controller
                control={form.control}
                name="images"
                render={({ field }) => (
                  <ImageUploader
                    label="Service image"
                    required
                    disabled={isPending}
                    value={field.value}
                    onChange={(images) => {
                      const previousUrl = field.value[0]?.url;
                      field.onChange(images);
                      if (images[0]?.url !== previousUrl) {
                        form.setValue("imageAlt", "", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                )}
              />
              {form.formState.errors.images?.message ? (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {form.formState.errors.images.message}
                </p>
              ) : null}
              <ServiceFormField htmlFor="service-image-alt" label="Image alternative text" required error={form.formState.errors.imageAlt?.message}>
                <Input id="service-image-alt" disabled={isPending} {...form.register("imageAlt")} />
              </ServiceFormField>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Features</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {features.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <ServiceFormField
                    className="flex-1"
                    htmlFor={`service-feature-${index}`}
                    label={`Feature ${index + 1}`}
                    error={form.formState.errors.features?.[index]?.value?.message}
                  >
                    <Input id={`service-feature-${index}`} disabled={isPending} {...form.register(`features.${index}.value`)} />
                  </ServiceFormField>
                  <Button
                    className="mt-7"
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={isPending}
                    aria-label={`Remove feature ${index + 1}`}
                    onClick={() => features.remove(index)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" disabled={isPending || features.fields.length >= 20} onClick={() => features.append({ value: "" })}>
                <Plus aria-hidden="true" /> Add feature
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div><p className="font-medium">Published</p><p className="text-xs text-muted-foreground">Visible on the public site.</p></div>
                <Switch checked={published} onCheckedChange={(checked) => form.setValue("published", checked, { shouldDirty: true })} disabled={isPending} aria-label="Publish service" />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
                <div><p className="font-medium">Featured</p><p className="text-xs text-muted-foreground">Eligible for the homepage.</p></div>
                <Switch checked={featured} onCheckedChange={(checked) => form.setValue("featured", checked, { shouldDirty: true })} disabled={isPending} aria-label="Feature service" />
              </div>
              <ServiceFormField htmlFor="service-order" label="Display order" required error={form.formState.errors.displayOrder?.message}>
                <Input id="service-order" type="number" min={0} max={10000} disabled={isPending} {...form.register("displayOrder", { valueAsNumber: true })} />
              </ServiceFormField>
              <ServiceFormField htmlFor="service-icon" label="Optional icon name" error={form.formState.errors.icon?.message}>
                <Input id="service-icon" disabled={isPending} {...form.register("icon")} />
              </ServiceFormField>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader><CardTitle>Search metadata</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ServiceFormField htmlFor="service-meta-title" label="SEO title" error={form.formState.errors.metaTitle?.message}>
                <Input id="service-meta-title" disabled={isPending} {...form.register("metaTitle")} />
              </ServiceFormField>
              <ServiceFormField htmlFor="service-meta-description" label="SEO description" error={form.formState.errors.metaDescription?.message}>
                <Textarea id="service-meta-description" rows={5} disabled={isPending} {...form.register("metaDescription")} />
              </ServiceFormField>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap justify-end gap-3 rounded-2xl border bg-background/95 p-4 shadow-lg supports-backdrop-filter:backdrop-blur">
        <Button type="submit" disabled={isPending || form.formState.isSubmitting}>
          {isPending || form.formState.isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
