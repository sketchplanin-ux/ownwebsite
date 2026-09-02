"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import {
  ImageUploader,
  type ImageUploaderImage,
} from "@/components/admin/image-uploader";
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
import { isSafeHttpUrl } from "@/lib/url";
import type { Banner } from "@/types/banner";

import { ScheduledContentFormField } from "./form-field";
import { useCreateAdminBanner, useUpdateAdminBanner } from "./hooks";
import { bannerFormValuesToInput, bannerToFormValues } from "./mappers";
import {
  bannerFormSchema,
  EMPTY_BANNER_FORM,
  type BannerFormValues,
} from "./schema";

interface BannerFormProps {
  initialBanner?: Banner;
}

function readableError(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "The banner could not be saved. Please try again.";
}

function uploaderValue(
  url: string,
  publicId: string,
  alt: string,
): ImageUploaderImage[] {
  return url.startsWith("https://") && isSafeHttpUrl(url)
    ? [{ url, publicId: publicId || undefined, alt }]
    : [];
}

export function BannerForm({ initialBanner }: BannerFormProps) {
  const router = useRouter();
  const admin = useAdmin();
  const createMutation = useCreateAdminBanner();
  const updateMutation = useUpdateAdminBanner();
  const isEditing = Boolean(initialBanner);
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: initialBanner
      ? bannerToFormValues(initialBanner)
      : { ...EMPTY_BANNER_FORM },
    mode: "onBlur",
  });
  const desktopImageUrl = useWatch({ control: form.control, name: "desktopImageUrl" });
  const desktopImagePublicId = useWatch({
    control: form.control,
    name: "desktopImagePublicId",
  });
  const desktopImageAlt = useWatch({ control: form.control, name: "desktopImageAlt" });
  const mobileImageUrl = useWatch({ control: form.control, name: "mobileImageUrl" });
  const mobileImagePublicId = useWatch({
    control: form.control,
    name: "mobileImagePublicId",
  });
  const mobileImageAlt = useWatch({ control: form.control, name: "mobileImageAlt" });
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canManage = admin.can(PERMISSIONS.MANAGE_BANNERS);
  const desktopUploaderValue = uploaderValue(
    desktopImageUrl,
    desktopImagePublicId,
    desktopImageAlt,
  );
  const mobileUploaderValue = uploaderValue(
    mobileImageUrl,
    mobileImagePublicId,
    mobileImageAlt,
  );

  const submit: SubmitHandler<BannerFormValues> = async (values) => {
    if (!canManage) {
      form.setError("root", {
        message: "You no longer have permission to manage banners.",
      });
      return;
    }

    try {
      const input = bannerFormValuesToInput(values);
      if (initialBanner) {
        await updateMutation.mutateAsync({ bannerId: initialBanner.id, input });
        toast.success("Banner updated.");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Banner created.");
      }
      router.push(ADMIN_ROUTES.banners);
    } catch (error) {
      const message = readableError(error);
      form.setError("root", { message });
      toast.error(message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6" noValidate>
      <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground uppercase">
            Banners / {isEditing ? "Edit" : "Create"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isEditing ? `Edit ${initialBanner?.title}` : "Create a banner"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure responsive artwork, call-to-action content, publishing order,
            and an optional visibility window.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" variant="outline">
            <Link href={ADMIN_ROUTES.banners}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving || !canManage}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create banner"}
          </Button>
        </div>
      </div>

      {form.formState.errors.root?.message ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {form.formState.errors.root.message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Banner content</CardTitle>
              <CardDescription>
                The title and optional supporting content shown over or beside the artwork.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ScheduledContentFormField
                htmlFor="banner-title"
                label="Title"
                required
                error={form.formState.errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-title"
                  {...form.register("title")}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-subtitle"
                label="Subtitle"
                error={form.formState.errors.subtitle?.message}
                className="sm:col-span-2"
              >
                <Textarea id="banner-subtitle" rows={4} {...form.register("subtitle")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-button-text"
                label="Button text"
                description="Button text and URL must be completed together."
                error={form.formState.errors.buttonText?.message}
              >
                <Input id="banner-button-text" {...form.register("buttonText")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-button-url"
                label="Button URL"
                description="Use a site-relative path or an HTTP(S) URL."
                error={form.formState.errors.buttonUrl?.message}
              >
                <Input
                  id="banner-button-url"
                  placeholder="/projects/"
                  {...form.register("buttonUrl")}
                  aria-invalid={Boolean(form.formState.errors.buttonUrl)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Desktop artwork</CardTitle>
              <CardDescription>
                Required image used for wide viewports. Upload or paste an existing image URL and object key.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ImageUploader
                className="sm:col-span-2"
                label="Upload desktop image"
                required
                disabled={isSaving}
                value={desktopUploaderValue}
                onChange={(images) => {
                  const image = images[0];
                  form.setValue("desktopImageUrl", image?.url ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("desktopImagePublicId", image?.publicId ?? "", {
                    shouldDirty: true,
                  });
                  if (!image) {
                    form.setValue("desktopImageAlt", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              />
              <ScheduledContentFormField
                htmlFor="banner-desktop-url"
                label="Image HTTPS URL"
                required
                error={form.formState.errors.desktopImageUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-desktop-url"
                  type="url"
                  placeholder="https://cdn.example.com/sketchplan/…"
                  {...form.register("desktopImageUrl")}
                  aria-invalid={Boolean(form.formState.errors.desktopImageUrl)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-desktop-public-id"
                label="Image object key"
                error={form.formState.errors.desktopImagePublicId?.message}
              >
                <Input id="banner-desktop-public-id" {...form.register("desktopImagePublicId")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-desktop-alt"
                label="Alt text"
                required
                error={form.formState.errors.desktopImageAlt?.message}
              >
                <Input
                  id="banner-desktop-alt"
                  {...form.register("desktopImageAlt")}
                  aria-invalid={Boolean(form.formState.errors.desktopImageAlt)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mobile artwork</CardTitle>
              <CardDescription>
                Optional portrait or compact artwork. Alt text is required when set.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ImageUploader
                className="sm:col-span-2"
                label="Upload mobile image"
                disabled={isSaving}
                value={mobileUploaderValue}
                onChange={(images) => {
                  const image = images[0];
                  form.setValue("mobileImageUrl", image?.url ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("mobileImagePublicId", image?.publicId ?? "", {
                    shouldDirty: true,
                  });
                  if (!image) {
                    form.setValue("mobileImageAlt", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              />
              <ScheduledContentFormField
                htmlFor="banner-mobile-url"
                label="Image HTTPS URL"
                error={form.formState.errors.mobileImageUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="banner-mobile-url"
                  type="url"
                  placeholder="https://cdn.example.com/sketchplan/…"
                  {...form.register("mobileImageUrl")}
                  aria-invalid={Boolean(form.formState.errors.mobileImageUrl)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-mobile-public-id"
                label="Image object key"
                error={form.formState.errors.mobileImagePublicId?.message}
              >
                <Input id="banner-mobile-public-id" {...form.register("mobileImagePublicId")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-mobile-alt"
                label="Alt text"
                error={form.formState.errors.mobileImageAlt?.message}
              >
                <Input
                  id="banner-mobile-alt"
                  {...form.register("mobileImageAlt")}
                  aria-invalid={Boolean(form.formState.errors.mobileImageAlt)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
              <CardDescription>
                Active banners are visible only while their optional schedule is current.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="banner-active"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="banner-active">Active</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Makes the banner eligible for public display.
                      </p>
                    </div>
                  </div>
                )}
              />
              <ScheduledContentFormField
                htmlFor="banner-order"
                label="Display order"
                required
                error={form.formState.errors.displayOrder?.message}
              >
                <Input
                  id="banner-order"
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  {...form.register("displayOrder", { valueAsNumber: true })}
                  aria-invalid={Boolean(form.formState.errors.displayOrder)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Leave either boundary blank for an open-ended window. Times use your browser timezone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <ScheduledContentFormField
                htmlFor="banner-start-at"
                label="Starts at"
                error={form.formState.errors.startAt?.message}
              >
                <Input id="banner-start-at" type="datetime-local" {...form.register("startAt")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="banner-end-at"
                label="Ends at"
                error={form.formState.errors.endAt?.message}
              >
                <Input
                  id="banner-end-at"
                  type="datetime-local"
                  {...form.register("endAt")}
                  aria-invalid={Boolean(form.formState.errors.endAt)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSaving || !canManage}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save banner" : "Create banner"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
