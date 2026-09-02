"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2Icon,
  Globe2Icon,
  SearchIcon,
  Share2Icon,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PermissionGate } from "@/components/admin/permission-gate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  GeneralSettingsInput,
  SeoSettingsInput,
} from "@/features/admin-settings/api";
import {
  DocumentNotice,
  EditorError,
  EditorLoading,
  FormActions,
  FormField,
  FormSection,
  FormTextarea,
  PermissionDenied,
  SaveFeedback,
} from "@/features/admin-settings/form-components";
import {
  useAdminGeneralSettings,
  useAdminSeoSettings,
  useAdminSocialSettings,
  useSaveGeneralSettings,
  useSaveSeoSettings,
  useSaveSocialSettings,
} from "@/features/admin-settings/hooks";
import {
  generalSettingsFormSchema,
  seoSettingsFormSchema,
  socialSettingsFormSchema,
  type GeneralSettingsFormValues,
  type SeoSettingsFormValues,
  type SocialSettingsFormValues,
} from "@/features/admin-settings/schemas";
import { PERMISSIONS } from "@/features/auth/permissions";
import { DEFAULT_GENERAL_SETTINGS } from "@/features/settings/defaults";
import type {
  GeneralSettings,
  SeoSettings,
  SocialSettings,
} from "@/types/settings";

const DEFAULT_SEO_DESCRIPTION =
  "Thoughtful architecture, interior design, and spatial planning by SKETCHPLAN, shaped with clarity, purpose, and enduring detail.";

function toGeneralFormValues(
  settings: GeneralSettings | null | undefined,
): GeneralSettingsFormValues {
  return {
    companyName: settings?.companyName ?? DEFAULT_GENERAL_SETTINGS.companyName,
    logoUrl: settings?.logoUrl ?? DEFAULT_GENERAL_SETTINGS.logoUrl,
    logoAlt: settings?.logoAlt ?? DEFAULT_GENERAL_SETTINGS.logoAlt,
    faviconUrl: settings?.faviconUrl ?? DEFAULT_GENERAL_SETTINGS.faviconUrl,
    phone: settings?.phone ?? DEFAULT_GENERAL_SETTINGS.phone,
    whatsappNumber:
      settings?.whatsappNumber ?? DEFAULT_GENERAL_SETTINGS.whatsappNumber,
    email: settings?.email ?? DEFAULT_GENERAL_SETTINGS.email,
    address: settings?.address ?? DEFAULT_GENERAL_SETTINGS.address,
    googleMapsUrl:
      settings?.googleMapsUrl ?? DEFAULT_GENERAL_SETTINGS.googleMapsUrl,
    officeHours: settings?.officeHours ?? DEFAULT_GENERAL_SETTINGS.officeHours,
    footerText: settings?.footerText ?? DEFAULT_GENERAL_SETTINGS.footerText,
    brandAccentColor:
      settings?.brandAccentColor ??
      DEFAULT_GENERAL_SETTINGS.brandAccentColor,
  };
}

function toSocialFormValues(
  settings: SocialSettings | null | undefined,
): SocialSettingsFormValues {
  return {
    facebookUrl: settings?.facebookUrl ?? "",
    instagramUrl: settings?.instagramUrl ?? "",
    linkedInUrl: settings?.linkedInUrl ?? "",
    youtubeUrl: settings?.youtubeUrl ?? "",
    whatsappUrl: settings?.whatsappUrl ?? "",
  };
}

function toSeoFormValues(
  settings: SeoSettings | null | undefined,
): SeoSettingsFormValues {
  return {
    defaultMetaTitle:
      settings?.defaultMetaTitle ??
      "SKETCHPLAN | Architecture, Interior & Planning",
    defaultMetaDescription:
      settings?.defaultMetaDescription ?? DEFAULT_SEO_DESCRIPTION,
    defaultOpenGraphImageUrl: settings?.defaultOpenGraphImageUrl ?? "",
    defaultOpenGraphImageAlt: settings?.defaultOpenGraphImageAlt ?? "",
    siteUrl: settings?.siteUrl ?? "",
    companySchema: {
      name: settings?.companySchema?.name ?? "SKETCHPLAN",
      legalName: settings?.companySchema?.legalName ?? "",
      description:
        settings?.companySchema?.description ?? DEFAULT_SEO_DESCRIPTION,
      email: settings?.companySchema?.email ?? "sketchplan.amc@gmail.com",
      phone: settings?.companySchema?.phone ?? "",
      address: settings?.companySchema?.address ?? "",
      priceRange: settings?.companySchema?.priceRange ?? "",
      areaServed: settings?.companySchema?.areaServed?.join("\n") ?? "",
    },
  };
}

function GeneralSettingsForm() {
  const query = useAdminGeneralSettings();
  const mutation = useSaveGeneralSettings();
  const form = useForm<GeneralSettingsFormValues>({
    resolver: zodResolver(generalSettingsFormSchema),
    defaultValues: toGeneralFormValues(null),
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toGeneralFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="general settings" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="general settings"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toGeneralFormValues(query.data));
  };

  const submitForm = async (values: GeneralSettingsFormValues) => {
    mutation.reset();

    try {
      await mutation.mutateAsync({
        values: values satisfies GeneralSettingsInput,
        previous: query.data,
      });
    } catch {
      // The mutation error is rendered below with a user-safe message.
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submitForm)}>
      {!query.data && <DocumentNotice documentName="General settings" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />

      <div className="grid gap-6 2xl:grid-cols-2">
        <FormSection
          title="Brand identity"
          description="Core company identity and client-facing brand assets."
        >
          <FormField
            id="settings-company-name"
            label="Company name"
            registration={form.register("companyName")}
            error={errors.companyName?.message}
            disabled={mutation.isPending}
          />
          <FormField
            id="settings-logo-url"
            label="Logo URL"
            registration={form.register("logoUrl")}
            error={errors.logoUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://… or /brand/logo.png"
            description="Use an existing media bucket URL or a public site asset."
          />
          <FormField
            id="settings-logo-alt"
            label="Logo alternative text"
            registration={form.register("logoAlt")}
            error={errors.logoAlt?.message}
            disabled={mutation.isPending}
          />
          <FormField
            id="settings-favicon-url"
            label="Favicon URL"
            registration={form.register("faviconUrl")}
            error={errors.faviconUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://… or /favicon.ico"
          />
          <FormField
            id="settings-accent-color"
            label="Brand accent color"
            registration={form.register("brandAccentColor")}
            error={errors.brandAccentColor?.message}
            disabled={mutation.isPending}
            placeholder="#9A6B42"
            description="Leave blank to use the application theme default."
          />
        </FormSection>

        <FormSection
          title="Contact details"
          description="Displayed in the website shell, contact area, and enquiry links."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="settings-phone"
              label="Phone"
              registration={form.register("phone")}
              error={errors.phone?.message}
              disabled={mutation.isPending}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
            <FormField
              id="settings-whatsapp"
              label="WhatsApp number"
              registration={form.register("whatsappNumber")}
              error={errors.whatsappNumber?.message}
              disabled={mutation.isPending}
              type="tel"
              inputMode="tel"
            />
          </div>
          <FormField
            id="settings-email"
            label="Email"
            registration={form.register("email")}
            error={errors.email?.message}
            disabled={mutation.isPending}
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <FormTextarea
            id="settings-address"
            label="Address"
            registration={form.register("address")}
            error={errors.address?.message}
            disabled={mutation.isPending}
            rows={4}
          />
          <FormTextarea
            id="settings-office-hours"
            label="Office hours"
            registration={form.register("officeHours")}
            error={errors.officeHours?.message}
            disabled={mutation.isPending}
            rows={3}
          />
        </FormSection>

        <FormSection
          title="Location"
          description="A browser-safe Google Maps embed or place URL."
        >
          <FormTextarea
            id="settings-map-url"
            label="Google Maps URL"
            registration={form.register("googleMapsUrl")}
            error={errors.googleMapsUrl?.message}
            disabled={mutation.isPending}
            rows={4}
            placeholder="https://www.google.com/maps/embed?…"
          />
        </FormSection>

        <FormSection
          title="Footer"
          description="Short supporting text shown with the company identity."
        >
          <FormTextarea
            id="settings-footer-text"
            label="Footer text"
            registration={form.register("footerText")}
            error={errors.footerText?.message}
            disabled={mutation.isPending}
            rows={4}
          />
        </FormSection>
      </div>

      <FormActions
        isPending={mutation.isPending}
        isDirty={isDirty}
        isNew={!query.data}
        onReset={resetForm}
      />
    </form>
  );
}

function SocialSettingsForm() {
  const query = useAdminSocialSettings();
  const mutation = useSaveSocialSettings();
  const form = useForm<SocialSettingsFormValues>({
    resolver: zodResolver(socialSettingsFormSchema),
    defaultValues: toSocialFormValues(null),
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toSocialFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="social settings" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="social settings"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toSocialFormValues(query.data));
  };

  const submitForm = async (values: SocialSettingsFormValues) => {
    mutation.reset();

    try {
      await mutation.mutateAsync({ values, previous: query.data });
    } catch {
      // The mutation error is rendered below with a user-safe message.
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submitForm)}>
      {!query.data && <DocumentNotice documentName="Social settings" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />

      <FormSection
        title="Social profiles"
        description="Leave a field blank to hide that network from public social links."
      >
        <div className="grid gap-5 xl:grid-cols-2">
          <FormField
            id="settings-facebook"
            label="Facebook URL"
            registration={form.register("facebookUrl")}
            error={errors.facebookUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://facebook.com/…"
          />
          <FormField
            id="settings-instagram"
            label="Instagram URL"
            registration={form.register("instagramUrl")}
            error={errors.instagramUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://instagram.com/…"
          />
          <FormField
            id="settings-linkedin"
            label="LinkedIn URL"
            registration={form.register("linkedInUrl")}
            error={errors.linkedInUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://linkedin.com/…"
          />
          <FormField
            id="settings-youtube"
            label="YouTube URL"
            registration={form.register("youtubeUrl")}
            error={errors.youtubeUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://youtube.com/…"
          />
          <FormField
            id="settings-whatsapp-url"
            label="WhatsApp URL"
            registration={form.register("whatsappUrl")}
            error={errors.whatsappUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://wa.me/…"
          />
        </div>
      </FormSection>

      <FormActions
        isPending={mutation.isPending}
        isDirty={isDirty}
        isNew={!query.data}
        onReset={resetForm}
      />
    </form>
  );
}

function SeoSettingsForm() {
  const query = useAdminSeoSettings();
  const mutation = useSaveSeoSettings();
  const form = useForm<SeoSettingsFormValues>({
    resolver: zodResolver(seoSettingsFormSchema),
    defaultValues: toSeoFormValues(null),
  });
  const { errors, isDirty } = form.formState;

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toSeoFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="SEO settings" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="SEO settings"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toSeoFormValues(query.data));
  };

  const submitForm = async (values: SeoSettingsFormValues) => {
    mutation.reset();
    const areaServed = values.companySchema.areaServed
      .split(/[\n,]+/)
      .map((area) => area.trim())
      .filter(Boolean);
    const input: SeoSettingsInput = {
      ...values,
      companySchema: {
        ...values.companySchema,
        areaServed,
      },
    };

    try {
      await mutation.mutateAsync({ values: input, previous: query.data });
    } catch {
      // The mutation error is rendered below with a user-safe message.
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submitForm)}>
      {!query.data && <DocumentNotice documentName="SEO settings" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />
      <Alert>
        <Globe2Icon aria-hidden="true" />
        <AlertTitle>Static export limitation</AlertTitle>
        <AlertDescription>
          These values are stored for shared SEO data and future builds. Content
          changed in Firestore cannot rewrite already exported page metadata until
          the site is rebuilt.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 2xl:grid-cols-2">
        <FormSection title="Default metadata">
          <FormField
            id="settings-default-meta-title"
            label="Default meta title"
            registration={form.register("defaultMetaTitle")}
            error={errors.defaultMetaTitle?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="settings-default-meta-description"
            label="Default meta description"
            registration={form.register("defaultMetaDescription")}
            error={errors.defaultMetaDescription?.message}
            disabled={mutation.isPending}
            rows={4}
          />
          <FormField
            id="settings-site-url"
            label="Canonical site URL"
            registration={form.register("siteUrl")}
            error={errors.siteUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://example.com"
          />
        </FormSection>

        <FormSection title="Open Graph image">
          <FormField
            id="settings-og-image"
            label="Default Open Graph image URL"
            registration={form.register("defaultOpenGraphImageUrl")}
            error={errors.defaultOpenGraphImageUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://… or /brand/social-card.jpg"
          />
          <FormField
            id="settings-og-image-alt"
            label="Open Graph image alternative text"
            registration={form.register("defaultOpenGraphImageAlt")}
            error={errors.defaultOpenGraphImageAlt?.message}
            disabled={mutation.isPending}
          />
        </FormSection>

        <FormSection
          title="Company schema"
          description="Organization and ProfessionalService structured data fields."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="settings-schema-name"
              label="Company name"
              registration={form.register("companySchema.name")}
              error={errors.companySchema?.name?.message}
              disabled={mutation.isPending}
            />
            <FormField
              id="settings-schema-legal-name"
              label="Legal name"
              registration={form.register("companySchema.legalName")}
              error={errors.companySchema?.legalName?.message}
              disabled={mutation.isPending}
            />
          </div>
          <FormTextarea
            id="settings-schema-description"
            label="Description"
            registration={form.register("companySchema.description")}
            error={errors.companySchema?.description?.message}
            disabled={mutation.isPending}
            rows={4}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="settings-schema-email"
              label="Email"
              registration={form.register("companySchema.email")}
              error={errors.companySchema?.email?.message}
              disabled={mutation.isPending}
              type="email"
            />
            <FormField
              id="settings-schema-phone"
              label="Phone"
              registration={form.register("companySchema.phone")}
              error={errors.companySchema?.phone?.message}
              disabled={mutation.isPending}
              type="tel"
            />
          </div>
          <FormTextarea
            id="settings-schema-address"
            label="Address"
            registration={form.register("companySchema.address")}
            error={errors.companySchema?.address?.message}
            disabled={mutation.isPending}
            rows={3}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              id="settings-schema-price-range"
              label="Price range"
              registration={form.register("companySchema.priceRange")}
              error={errors.companySchema?.priceRange?.message}
              disabled={mutation.isPending}
              placeholder="Example: ₹₹"
            />
            <FormTextarea
              id="settings-schema-areas"
              label="Areas served"
              registration={form.register("companySchema.areaServed")}
              error={errors.companySchema?.areaServed?.message}
              disabled={mutation.isPending}
              rows={4}
              description="Enter one area per line or separate areas with commas."
            />
          </div>
        </FormSection>
      </div>

      <FormActions
        isPending={mutation.isPending}
        isDirty={isDirty}
        isNew={!query.data}
        onReset={resetForm}
      />
    </form>
  );
}

function SettingsWorkspace() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
            <Building2Icon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-semibold">Site settings</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              Manage shared identity, contact, social, and search metadata. Each
              tab saves to its matching document in the siteSettings collection.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="h-auto w-full justify-start overflow-x-auto p-1">
          <TabsTrigger value="general" className="min-h-9 px-3">
            <Building2Icon aria-hidden="true" />
            General
          </TabsTrigger>
          <TabsTrigger value="social" className="min-h-9 px-3">
            <Share2Icon aria-hidden="true" />
            Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="min-h-9 px-3">
            <SearchIcon aria-hidden="true" />
            SEO
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="pt-4">
          <GeneralSettingsForm />
        </TabsContent>
        <TabsContent value="social" className="pt-4">
          <SocialSettingsForm />
        </TabsContent>
        <TabsContent value="seo" className="pt-4">
          <SeoSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function SettingsScreen() {
  return (
    <PermissionGate
      permissions={PERMISSIONS.MANAGE_SETTINGS}
      loadingFallback={<EditorLoading label="settings permissions" />}
      fallback={<PermissionDenied />}
    >
      <SettingsWorkspace />
    </PermissionGate>
  );
}

