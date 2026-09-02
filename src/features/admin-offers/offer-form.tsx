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
import { ScheduledContentFormField } from "@/features/admin-banners/form-field";
import { PERMISSIONS } from "@/features/auth/permissions";
import { useAdmin } from "@/hooks/use-admin";
import { ADMIN_ROUTES } from "@/lib/constants";
import { isSafeHttpUrl } from "@/lib/url";
import type { Offer } from "@/types/offer";

import { useCreateAdminOffer, useUpdateAdminOffer } from "./hooks";
import { offerFormValuesToInput, offerToFormValues } from "./mappers";
import {
  EMPTY_OFFER_FORM,
  offerFormSchema,
  type OfferFormValues,
} from "./schema";

interface OfferFormProps {
  initialOffer?: Offer;
}

function readableError(error: unknown): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : "The offer could not be saved. Please try again.";
}

export function OfferForm({ initialOffer }: OfferFormProps) {
  const router = useRouter();
  const admin = useAdmin();
  const createMutation = useCreateAdminOffer();
  const updateMutation = useUpdateAdminOffer();
  const isEditing = Boolean(initialOffer);
  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: initialOffer
      ? offerToFormValues(initialOffer)
      : { ...EMPTY_OFFER_FORM },
    mode: "onBlur",
  });
  const imageUrl = useWatch({ control: form.control, name: "imageUrl" });
  const imagePublicId = useWatch({ control: form.control, name: "imagePublicId" });
  const imageAlt = useWatch({ control: form.control, name: "imageAlt" });
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const canManage = admin.can(PERMISSIONS.MANAGE_OFFERS);
  const imageUploaderValue: ImageUploaderImage[] =
    imageUrl.startsWith("https://") && isSafeHttpUrl(imageUrl)
      ? [{ url: imageUrl, publicId: imagePublicId || undefined, alt: imageAlt }]
      : [];

  const submit: SubmitHandler<OfferFormValues> = async (values) => {
    if (!canManage) {
      form.setError("root", {
        message: "You no longer have permission to manage offers.",
      });
      return;
    }

    try {
      const input = offerFormValuesToInput(values);
      if (initialOffer) {
        await updateMutation.mutateAsync({ offerId: initialOffer.id, input });
        toast.success("Offer updated.");
      } else {
        await createMutation.mutateAsync(input);
        toast.success("Offer created.");
      }
      router.push(ADMIN_ROUTES.offers);
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
            Offers / {isEditing ? "Edit" : "Create"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {isEditing ? `Edit ${initialOffer?.title}` : "Create an offer"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure offer copy, optional artwork and action, public placements,
            display order, and an optional visibility window.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild type="button" variant="outline">
            <Link href={ADMIN_ROUTES.offers}>
              <ArrowLeft aria-hidden="true" />
              Back
            </Link>
          </Button>
          <Button type="submit" disabled={isSaving || !canManage}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save changes" : "Create offer"}
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
              <CardTitle>Offer content</CardTitle>
              <CardDescription>
                Core copy shown in homepage or popup placements.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ScheduledContentFormField
                htmlFor="offer-title"
                label="Title"
                required
                error={form.formState.errors.title?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="offer-title"
                  {...form.register("title")}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-description"
                label="Description"
                required
                error={form.formState.errors.description?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  id="offer-description"
                  rows={8}
                  {...form.register("description")}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-button-text"
                label="Button text"
                description="Button text and URL must be completed together."
                error={form.formState.errors.buttonText?.message}
              >
                <Input id="offer-button-text" {...form.register("buttonText")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-button-url"
                label="Button URL"
                description="Use a site-relative path or an HTTP(S) URL."
                error={form.formState.errors.buttonUrl?.message}
              >
                <Input
                  id="offer-button-url"
                  placeholder="/contact/"
                  {...form.register("buttonUrl")}
                  aria-invalid={Boolean(form.formState.errors.buttonUrl)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offer artwork</CardTitle>
              <CardDescription>
                Optional artwork. Alt text becomes required when an image is attached.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <ImageUploader
                className="sm:col-span-2"
                label="Upload offer image"
                disabled={isSaving}
                value={imageUploaderValue}
                onChange={(images) => {
                  const image = images[0];
                  form.setValue("imageUrl", image?.url ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("imagePublicId", image?.publicId ?? "", {
                    shouldDirty: true,
                  });
                  if (!image) {
                    form.setValue("imageAlt", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
              />
              <ScheduledContentFormField
                htmlFor="offer-image-url"
                label="Image HTTPS URL"
                error={form.formState.errors.imageUrl?.message}
                className="sm:col-span-2"
              >
                <Input
                  id="offer-image-url"
                  type="url"
                  placeholder="https://cdn.example.com/sketchplan/…"
                  {...form.register("imageUrl")}
                  aria-invalid={Boolean(form.formState.errors.imageUrl)}
                />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-image-public-id"
                label="Image object key"
                error={form.formState.errors.imagePublicId?.message}
              >
                <Input id="offer-image-public-id" {...form.register("imagePublicId")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-image-alt"
                label="Alt text"
                error={form.formState.errors.imageAlt?.message}
              >
                <Input
                  id="offer-image-alt"
                  {...form.register("imageAlt")}
                  aria-invalid={Boolean(form.formState.errors.imageAlt)}
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
                Select where this offer can appear when active and in schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Controller
                control={form.control}
                name="active"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="offer-active"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="offer-active">Active</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Makes the offer eligible for public display.
                      </p>
                    </div>
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="showOnHomepage"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="offer-homepage"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="offer-homepage">Show on homepage</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Includes the offer in homepage offer placements.
                      </p>
                    </div>
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="showAsPopup"
                render={({ field }) => (
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="offer-popup"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                    />
                    <div>
                      <Label htmlFor="offer-popup">Show as popup</Label>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Makes the offer eligible for the site popup.
                      </p>
                    </div>
                  </div>
                )}
              />
              <ScheduledContentFormField
                htmlFor="offer-order"
                label="Display order"
                required
                error={form.formState.errors.displayOrder?.message}
              >
                <Input
                  id="offer-order"
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
                htmlFor="offer-start-at"
                label="Starts at"
                error={form.formState.errors.startAt?.message}
              >
                <Input id="offer-start-at" type="datetime-local" {...form.register("startAt")} />
              </ScheduledContentFormField>
              <ScheduledContentFormField
                htmlFor="offer-end-at"
                label="Ends at"
                error={form.formState.errors.endAt?.message}
              >
                <Input
                  id="offer-end-at"
                  type="datetime-local"
                  {...form.register("endAt")}
                  aria-invalid={Boolean(form.formState.errors.endAt)}
                />
              </ScheduledContentFormField>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSaving || !canManage}>
            <Save aria-hidden="true" />
            {isSaving ? "Saving…" : isEditing ? "Save offer" : "Create offer"}
          </Button>
        </aside>
      </div>
    </form>
  );
}
