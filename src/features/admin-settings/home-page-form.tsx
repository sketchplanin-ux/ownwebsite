"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { HomePageInput } from "@/features/admin-settings/api";
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
  useAdminHomePage,
  useSaveHomePage,
} from "@/features/admin-settings/hooks";
import {
  CallToActionSection,
  PageIdentitySection,
} from "@/features/admin-settings/page-form-components";
import {
  homePageFormSchema,
  pageFeatureListSchema,
  parseStructuredJson,
  processStepListSchema,
  type HomePageFormValues,
} from "@/features/admin-settings/schemas";
import {
  DEFAULT_CONTACT_CTA,
  DEFAULT_HOME_CONTENT,
} from "@/features/home/defaults";
import type { HomePageDocument } from "@/types/page";

function toHomePageFormValues(
  page: HomePageDocument | null | undefined,
): HomePageFormValues {
  return {
    title: page?.title ?? "Home",
    published: page?.published ?? false,
    metaTitle: page?.metaTitle ?? "",
    metaDescription: page?.metaDescription ?? "",
    introductionHeading:
      page?.introductionHeading ?? DEFAULT_HOME_CONTENT.introductionHeading,
    introductionBody:
      page?.introductionBody ?? DEFAULT_HOME_CONTENT.introductionBody,
    introductionImageUrl: page?.introductionImage?.imageUrl ?? "",
    introductionImageAlt: page?.introductionImage?.imageAlt ?? "",
    whyChooseHeading:
      page?.whyChooseHeading ?? DEFAULT_HOME_CONTENT.whyChooseHeading,
    whyChooseItemsJson: JSON.stringify(
      page?.whyChooseItems ?? DEFAULT_HOME_CONTENT.whyChooseItems,
      null,
      2,
    ),
    processHeading: page?.processHeading ?? DEFAULT_HOME_CONTENT.processHeading,
    processStepsJson: JSON.stringify(
      page?.processSteps ?? DEFAULT_HOME_CONTENT.processSteps,
      null,
      2,
    ),
    contactCallToAction: {
      heading:
        page?.contactCallToAction?.heading ?? DEFAULT_CONTACT_CTA.heading,
      description:
        page?.contactCallToAction?.description ??
        DEFAULT_CONTACT_CTA.description,
      buttonText:
        page?.contactCallToAction?.buttonText ?? DEFAULT_CONTACT_CTA.buttonText,
      buttonUrl:
        page?.contactCallToAction?.buttonUrl ?? DEFAULT_CONTACT_CTA.buttonUrl,
    },
  };
}

export function HomePageForm() {
  const query = useAdminHomePage();
  const mutation = useSaveHomePage();
  const form = useForm<HomePageFormValues>({
    resolver: zodResolver(homePageFormSchema),
    defaultValues: toHomePageFormValues(null),
  });
  const { errors, isDirty } = form.formState;
  const published = useWatch({ control: form.control, name: "published" });

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toHomePageFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="homepage content" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="homepage content"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toHomePageFormValues(query.data));
  };

  const submitForm = async (values: HomePageFormValues) => {
    mutation.reset();
    const existingImage = query.data?.introductionImage;
    const introductionImage = values.introductionImageUrl
      ? {
          imageUrl: values.introductionImageUrl,
          imageAlt: values.introductionImageAlt,
          ...(existingImage?.imageUrl === values.introductionImageUrl &&
          existingImage.imagePublicId
            ? { imagePublicId: existingImage.imagePublicId }
            : {}),
        }
      : null;
    const input: HomePageInput = {
      title: values.title,
      published: values.published,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      introductionHeading: values.introductionHeading,
      introductionBody: values.introductionBody,
      introductionImage,
      whyChooseHeading: values.whyChooseHeading,
      whyChooseItems: parseStructuredJson(
        values.whyChooseItemsJson,
        pageFeatureListSchema,
      ),
      processHeading: values.processHeading,
      processSteps: parseStructuredJson(
        values.processStepsJson,
        processStepListSchema,
      ),
      contactCallToAction: values.contactCallToAction,
    };

    try {
      await mutation.mutateAsync({ values: input, isNew: !query.data });
    } catch {
      // The mutation error is rendered below with a user-safe message.
    }
  };

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submitForm)}>
      {!query.data && <DocumentNotice documentName="Homepage" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />

      <div className="grid gap-6 2xl:grid-cols-2">
        <PageIdentitySection
          idPrefix="home"
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
          title="Introduction"
          description="The primary company introduction displayed after the hero area."
        >
          <FormField
            id="home-introduction-heading"
            label="Heading"
            registration={form.register("introductionHeading")}
            error={errors.introductionHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="home-introduction-body"
            label="Body"
            registration={form.register("introductionBody")}
            error={errors.introductionBody?.message}
            disabled={mutation.isPending}
            rows={7}
          />
          <FormField
            id="home-introduction-image-url"
            label="Image URL"
            registration={form.register("introductionImageUrl")}
            error={errors.introductionImageUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://…"
          />
          <FormField
            id="home-introduction-image-alt"
            label="Image alternative text"
            registration={form.register("introductionImageAlt")}
            error={errors.introductionImageAlt?.message}
            disabled={mutation.isPending}
          />
        </FormSection>

        <FormSection
          title="Why choose SKETCHPLAN"
          description="Repeatable cards stored as a structured array."
        >
          <FormField
            id="home-why-heading"
            label="Section heading"
            registration={form.register("whyChooseHeading")}
            error={errors.whyChooseHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="home-why-items"
            label="Items JSON"
            registration={form.register("whyChooseItemsJson")}
            error={errors.whyChooseItemsJson?.message}
            disabled={mutation.isPending}
            rows={16}
            json
            description='Each item requires "id", "title", "description", and numeric "displayOrder"; "icon" is optional.'
          />
        </FormSection>

        <FormSection
          title="Working process"
          description="Ordered process steps displayed on the homepage."
        >
          <FormField
            id="home-process-heading"
            label="Section heading"
            registration={form.register("processHeading")}
            error={errors.processHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="home-process-steps"
            label="Process steps JSON"
            registration={form.register("processStepsJson")}
            error={errors.processStepsJson?.message}
            disabled={mutation.isPending}
            rows={16}
            json
            description='Each step requires "id", "title", "description", and numeric "displayOrder".'
          />
        </FormSection>

        <CallToActionSection
          idPrefix="home"
          headingRegistration={form.register("contactCallToAction.heading")}
          headingError={errors.contactCallToAction?.heading?.message}
          descriptionRegistration={form.register(
            "contactCallToAction.description",
          )}
          descriptionError={errors.contactCallToAction?.description?.message}
          buttonTextRegistration={form.register(
            "contactCallToAction.buttonText",
          )}
          buttonTextError={errors.contactCallToAction?.buttonText?.message}
          buttonUrlRegistration={form.register(
            "contactCallToAction.buttonUrl",
          )}
          buttonUrlError={errors.contactCallToAction?.buttonUrl?.message}
          disabled={mutation.isPending}
        />
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
