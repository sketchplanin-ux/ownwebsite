"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormSection,
  FormTextarea,
} from "@/features/admin-settings/form-components";
import type { UseFormRegisterReturn } from "react-hook-form";

interface PageIdentitySectionProps {
  titleRegistration: UseFormRegisterReturn;
  titleError?: string;
  metaTitleRegistration: UseFormRegisterReturn;
  metaTitleError?: string;
  metaDescriptionRegistration: UseFormRegisterReturn;
  metaDescriptionError?: string;
  published: boolean;
  onPublishedChange: (published: boolean) => void;
  disabled: boolean;
  idPrefix: string;
}

export function PageIdentitySection({
  titleRegistration,
  titleError,
  metaTitleRegistration,
  metaTitleError,
  metaDescriptionRegistration,
  metaDescriptionError,
  published,
  onPublishedChange,
  disabled,
  idPrefix,
}: PageIdentitySectionProps) {
  return (
    <FormSection
      title="Page and publication"
      description="Control the page label, public visibility, and editor-managed SEO fields."
    >
      <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
        <div>
          <div className="flex items-center gap-2">
            <label htmlFor={`${idPrefix}-published`} className="font-medium">
              Published
            </label>
            <Badge variant={published ? "default" : "secondary"}>
              {published ? "Public" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Unpublished managed documents are hidden by the public page query.
          </p>
        </div>
        <Switch
          id={`${idPrefix}-published`}
          checked={published}
          onCheckedChange={onPublishedChange}
          disabled={disabled}
          aria-label="Publish this managed page"
        />
      </div>
      <FormField
        id={`${idPrefix}-title`}
        label="Page title"
        registration={titleRegistration}
        error={titleError}
        disabled={disabled}
      />
      <FormField
        id={`${idPrefix}-meta-title`}
        label="Meta title"
        registration={metaTitleRegistration}
        error={metaTitleError}
        disabled={disabled}
        description="Stored with the managed page. Static metadata changes require a rebuild."
      />
      <FormTextarea
        id={`${idPrefix}-meta-description`}
        label="Meta description"
        registration={metaDescriptionRegistration}
        error={metaDescriptionError}
        disabled={disabled}
        rows={3}
      />
    </FormSection>
  );
}

interface CallToActionSectionProps {
  headingRegistration: UseFormRegisterReturn;
  headingError?: string;
  descriptionRegistration: UseFormRegisterReturn;
  descriptionError?: string;
  buttonTextRegistration: UseFormRegisterReturn;
  buttonTextError?: string;
  buttonUrlRegistration: UseFormRegisterReturn;
  buttonUrlError?: string;
  disabled: boolean;
  idPrefix: string;
}

export function CallToActionSection({
  headingRegistration,
  headingError,
  descriptionRegistration,
  descriptionError,
  buttonTextRegistration,
  buttonTextError,
  buttonUrlRegistration,
  buttonUrlError,
  disabled,
  idPrefix,
}: CallToActionSectionProps) {
  return (
    <FormSection
      title="Contact call to action"
      description="The closing prompt that directs visitors to their next step."
    >
      <FormField
        id={`${idPrefix}-cta-heading`}
        label="Heading"
        registration={headingRegistration}
        error={headingError}
        disabled={disabled}
      />
      <FormTextarea
        id={`${idPrefix}-cta-description`}
        label="Description"
        registration={descriptionRegistration}
        error={descriptionError}
        disabled={disabled}
        rows={4}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          id={`${idPrefix}-cta-button-text`}
          label="Button text"
          registration={buttonTextRegistration}
          error={buttonTextError}
          disabled={disabled}
        />
        <FormField
          id={`${idPrefix}-cta-button-url`}
          label="Button URL"
          registration={buttonUrlRegistration}
          error={buttonUrlError}
          disabled={disabled}
          placeholder="/contact/"
        />
      </div>
    </FormSection>
  );
}

