"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

import type { AboutPageInput } from "@/features/admin-settings/api";
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
  useAdminAboutPage,
  useSaveAboutPage,
} from "@/features/admin-settings/hooks";
import {
  CallToActionSection,
  PageIdentitySection,
} from "@/features/admin-settings/page-form-components";
import {
  aboutPageFormSchema,
  awardListSchema,
  pageFeatureListSchema,
  parseStructuredJson,
  processStepListSchema,
  teamMemberListSchema,
  type AboutPageFormValues,
} from "@/features/admin-settings/schemas";
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CTA,
} from "@/features/home/defaults";
import type { AboutPageDocument } from "@/types/page";

function toAboutPageFormValues(
  page: AboutPageDocument | null | undefined,
): AboutPageFormValues {
  return {
    title: page?.title ?? "About",
    published: page?.published ?? false,
    metaTitle: page?.metaTitle ?? "",
    metaDescription: page?.metaDescription ?? "",
    introduction: page?.introduction ?? DEFAULT_ABOUT_CONTENT.introduction,
    heroImageUrl: page?.heroImage?.imageUrl ?? "",
    heroImageAlt: page?.heroImage?.imageAlt ?? "",
    mission: page?.mission ?? DEFAULT_ABOUT_CONTENT.mission,
    vision: page?.vision ?? DEFAULT_ABOUT_CONTENT.vision,
    experience: page?.experience ?? DEFAULT_ABOUT_CONTENT.experience,
    teamHeading: page?.teamHeading ?? DEFAULT_ABOUT_CONTENT.teamHeading,
    teamMembersJson: JSON.stringify(
      page?.teamMembers ?? DEFAULT_ABOUT_CONTENT.teamMembers,
      null,
      2,
    ),
    processHeading:
      page?.processHeading ?? DEFAULT_ABOUT_CONTENT.processHeading,
    processStepsJson: JSON.stringify(
      page?.processSteps ?? DEFAULT_ABOUT_CONTENT.processSteps,
      null,
      2,
    ),
    whyChooseHeading:
      page?.whyChooseHeading ?? DEFAULT_ABOUT_CONTENT.whyChooseHeading,
    whyChooseItemsJson: JSON.stringify(
      page?.whyChooseItems ?? DEFAULT_ABOUT_CONTENT.whyChooseItems,
      null,
      2,
    ),
    awardsHeading: page?.awardsHeading ?? DEFAULT_ABOUT_CONTENT.awardsHeading,
    awardsJson: JSON.stringify(
      page?.awards ?? DEFAULT_ABOUT_CONTENT.awards,
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

export function AboutPageForm() {
  const query = useAdminAboutPage();
  const mutation = useSaveAboutPage();
  const form = useForm<AboutPageFormValues>({
    resolver: zodResolver(aboutPageFormSchema),
    defaultValues: toAboutPageFormValues(null),
  });
  const { errors, isDirty } = form.formState;
  const published = useWatch({ control: form.control, name: "published" });

  useEffect(() => {
    if (query.data !== undefined) {
      form.reset(toAboutPageFormValues(query.data));
    }
  }, [form, query.data]);

  if (query.isPending) {
    return <EditorLoading label="About page content" />;
  }

  if (query.isError) {
    return (
      <EditorError
        label="About page content"
        error={query.error}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const resetForm = () => {
    mutation.reset();
    form.reset(toAboutPageFormValues(query.data));
  };

  const submitForm = async (values: AboutPageFormValues) => {
    mutation.reset();
    const existingImage = query.data?.heroImage;
    const heroImage = values.heroImageUrl
      ? {
          imageUrl: values.heroImageUrl,
          imageAlt: values.heroImageAlt,
          ...(existingImage?.imageUrl === values.heroImageUrl &&
          existingImage.imagePublicId
            ? { imagePublicId: existingImage.imagePublicId }
            : {}),
        }
      : null;
    const input: AboutPageInput = {
      title: values.title,
      published: values.published,
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      introduction: values.introduction,
      heroImage,
      mission: values.mission,
      vision: values.vision,
      experience: values.experience,
      teamHeading: values.teamHeading,
      teamMembers: parseStructuredJson(
        values.teamMembersJson,
        teamMemberListSchema,
      ),
      processHeading: values.processHeading,
      processSteps: parseStructuredJson(
        values.processStepsJson,
        processStepListSchema,
      ),
      whyChooseHeading: values.whyChooseHeading,
      whyChooseItems: parseStructuredJson(
        values.whyChooseItemsJson,
        pageFeatureListSchema,
      ),
      awardsHeading: values.awardsHeading,
      awards: parseStructuredJson(values.awardsJson, awardListSchema),
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
      {!query.data && <DocumentNotice documentName="About page" />}
      <SaveFeedback isSuccess={mutation.isSuccess} error={mutation.error} />

      <div className="grid gap-6 2xl:grid-cols-2">
        <PageIdentitySection
          idPrefix="about"
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

        <FormSection title="Introduction and hero">
          <FormTextarea
            id="about-introduction"
            label="Company introduction"
            registration={form.register("introduction")}
            error={errors.introduction?.message}
            disabled={mutation.isPending}
            rows={7}
          />
          <FormField
            id="about-hero-image-url"
            label="Hero image URL"
            registration={form.register("heroImageUrl")}
            error={errors.heroImageUrl?.message}
            disabled={mutation.isPending}
            placeholder="https://…"
          />
          <FormField
            id="about-hero-image-alt"
            label="Hero image alternative text"
            registration={form.register("heroImageAlt")}
            error={errors.heroImageAlt?.message}
            disabled={mutation.isPending}
          />
        </FormSection>

        <FormSection title="Purpose and experience">
          <FormTextarea
            id="about-mission"
            label="Mission"
            registration={form.register("mission")}
            error={errors.mission?.message}
            disabled={mutation.isPending}
            rows={5}
          />
          <FormTextarea
            id="about-vision"
            label="Vision"
            registration={form.register("vision")}
            error={errors.vision?.message}
            disabled={mutation.isPending}
            rows={5}
          />
          <FormTextarea
            id="about-experience"
            label="Experience"
            registration={form.register("experience")}
            error={errors.experience?.message}
            disabled={mutation.isPending}
            rows={5}
          />
        </FormSection>

        <FormSection
          title="Team members"
          description="Ordered team profiles stored as structured JSON."
        >
          <FormField
            id="about-team-heading"
            label="Section heading"
            registration={form.register("teamHeading")}
            error={errors.teamHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="about-team-members"
            label="Team members JSON"
            registration={form.register("teamMembersJson")}
            error={errors.teamMembersJson?.message}
            disabled={mutation.isPending}
            rows={20}
            json
            description='Each member requires "id", "name", "role", "imageUrl", "imageAlt", and numeric "displayOrder". Biography and Image object key are optional.'
          />
        </FormSection>

        <FormSection title="Working process">
          <FormField
            id="about-process-heading"
            label="Section heading"
            registration={form.register("processHeading")}
            error={errors.processHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="about-process-steps"
            label="Process steps JSON"
            registration={form.register("processStepsJson")}
            error={errors.processStepsJson?.message}
            disabled={mutation.isPending}
            rows={16}
            json
            description='Each step requires "id", "title", "description", and numeric "displayOrder".'
          />
        </FormSection>

        <FormSection title="Why choose us">
          <FormField
            id="about-why-heading"
            label="Section heading"
            registration={form.register("whyChooseHeading")}
            error={errors.whyChooseHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="about-why-items"
            label="Items JSON"
            registration={form.register("whyChooseItemsJson")}
            error={errors.whyChooseItemsJson?.message}
            disabled={mutation.isPending}
            rows={16}
            json
            description='Each item requires "id", "title", "description", and numeric "displayOrder"; "icon" is optional.'
          />
        </FormSection>

        <FormSection title="Awards and certifications">
          <FormField
            id="about-awards-heading"
            label="Section heading"
            registration={form.register("awardsHeading")}
            error={errors.awardsHeading?.message}
            disabled={mutation.isPending}
          />
          <FormTextarea
            id="about-awards"
            label="Awards JSON"
            registration={form.register("awardsJson")}
            error={errors.awardsJson?.message}
            disabled={mutation.isPending}
            rows={18}
            json
            description='Use [] when there are no verified awards. Each entry requires "id", "title", image fields, and numeric "displayOrder".'
          />
        </FormSection>

        <CallToActionSection
          idPrefix="about"
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
