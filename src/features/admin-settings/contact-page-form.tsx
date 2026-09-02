"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { ContactPageInput } from "@/features/admin-settings/api";
import {
  DocumentNotice,
  EditorError,
  EditorLoading,
  FormActions,
  FormField,
  FormSection,
  FormTextarea,
  SaveFeedback,
} from "@/features/admin-settings/form-components";
import {
  useAdminContactPage,
  useSaveContactPage,
} from "@/features/admin-settings/hooks";
import { PageIdentitySection } from "@/features/admin-settings/page-form-components";
import {
  contactPageFormSchema,
  type ContactPageFormValues,
} from "@/features/admin-settings/schemas";
import type { ContactPageDocument } from "@/types/page";

function toContactPageFormValues(
  page: ContactPageDocument | null | undefined,
): ContactPageFormValues {
  return {
    title: page?.title ?? "Contact",
    published: page?.published ?? false,
    metaTitle: page?.metaTitle ?? "",
    metaDescription: page?.metaDescription ?? "",
    heading: page?.heading ?? "Start a conversation",
    introduction:
      page?.introduction ??
      "Tell SKETCHPLAN about the architecture, interior design, or planning support you need.",
    formHeading: page?.formHeading ?? "Share your project details",
    mapHeading: page?.mapHeading ?? "Find the studio",
  };
}

export function ContactPageForm() {
  const query = useAdminContactPage();
  const mutation = useSaveContactPage();
  const form = useForm<ContactPageFormValues>({
    resolver: zodResolver(contactPageFormSchema),
    defaultValues: toContactPageFormValues(null),
  });
  const { errors, isDirty } = form.formState;
  const published = useWatch({ control: form.control, name: "published" });

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toContactPageFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="Contact page content" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="Contact page content"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toContactPageFormValues(query.data));
  };

  const submitForm = async (values: ContactPageFormValues) => {
    mutation.reset();
    const input: ContactPageInput = values;

    try {
      await mutation.mutateAsync({ values: input, isNew: !query.data });
    } catch {
      // The mutation error is rendered below with a user-safe message.
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submitForm)}>
      {!query.data && <DocumentNotice documentName="Contact page" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />

      <div className="grid gap-6 2xl:grid-cols-2">
        <PageIdentitySection
          idPrefix="contact"
          titleRegistration={form.register("title")}
          titleError={errors.title?.message}
          metaTitleRegistration={form.register("metaTitle")}
          metaTitleError={errors.metaTitle?.message}
          metaDescriptionRegistration={form.register("metaDescription")}
          metaDescriptionError={errors.metaDescription?.message}
          published={published}
          onPublishedChange={(checked) =>
            form.setValue("published", checked, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          disabled={mutation.isPending}
        />

        <FormSection
          title="Contact page content"
          description="Headings and introduction surrounding the enquiry form and map."
        >
          <FormField
            id="contact-heading"
            label="Page heading"
            registration={form.register("heading")}
            error={errors.heading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="contact-introduction"
            label="Introduction"
            registration={form.register("introduction")}
            error={errors.introduction?.message}
            disabled={mutation.isPending}
            rows={7}
          />
          <FormField
            id="contact-form-heading"
            label="Enquiry form heading"
            registration={form.register("formHeading")}
            error={errors.formHeading?.message}
            disabled={mutation.isPending}
          />
          <FormField
            id="contact-map-heading"
            label="Map heading"
            registration={form.register("mapHeading")}
            error={errors.mapHeading?.message}
            disabled={mutation.isPending}
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
