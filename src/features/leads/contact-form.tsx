"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseErrorMessage } from "@/firebase/errors"
import { createLead } from "@/features/leads/api"
import {
  leadFormSchema,
  type ContactFormValues,
} from "@/features/leads/schema"
import { cn } from "@/lib/utils"

const COOLDOWN_MS = 60_000
const COOLDOWN_STORAGE_KEY = "sketchplan:last-lead-submission"
const SERVICE_OPTIONS = [
  "Architecture Design",
  "Interior Design",
  "Building Planning",
  "Renovation and Remodeling",
  "Residential Design",
  "Commercial Design",
] as const

let mostRecentSubmission = 0

interface ContactFormProps {
  className?: string
}

interface FieldErrorProps {
  id: string
  message?: string
}

function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  )
}

function readLastSubmissionTime() {
  if (typeof window === "undefined") {
    return mostRecentSubmission
  }

  try {
    const storedValue = Number(window.sessionStorage.getItem(COOLDOWN_STORAGE_KEY))
    return Number.isFinite(storedValue)
      ? Math.max(mostRecentSubmission, storedValue)
      : mostRecentSubmission
  } catch {
    return mostRecentSubmission
  }
}

function recordSubmissionTime(submittedAt: number) {
  mostRecentSubmission = submittedAt
  try {
    window.sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(submittedAt))
  } catch {
    // The in-memory cooldown remains active when storage is unavailable.
  }
}

function getCooldownWaitTime() {
  return COOLDOWN_MS - (Date.now() - readLastSubmissionTime())
}

function recordSubmissionNow() {
  recordSubmissionTime(Date.now())
}

function ContactForm({ className }: ContactFormProps) {
  const [result, setResult] = React.useState<
    { kind: "error" | "success"; message: string } | undefined
  >()
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      service: "",
      message: "",
      consent: false,
      website: "",
    },
  })
  const {
    formState: { errors, isSubmitting },
    register,
  } = form

  const submitForm = async (values: ContactFormValues) => {
    setResult(undefined)

    if (values.website.trim()) {
      form.reset()
      setResult({
        kind: "success",
        message: "Thank you. Your enquiry has been received.",
      })
      return
    }

    const waitTime = getCooldownWaitTime()
    if (waitTime > 0) {
      setResult({
        kind: "error",
        message: `Please wait ${Math.ceil(waitTime / 1_000)} seconds before sending another enquiry.`,
      })
      return
    }

    try {
      await createLead({
        name: values.name,
        phone: values.phone,
        email: values.email,
        service: values.service,
        message: values.message,
      })
      recordSubmissionNow()
      form.reset()
      setResult({
        kind: "success",
        message:
          "Thank you. Your enquiry has been sent and the SKETCHPLAN team will contact you soon.",
      })
    } catch (error) {
      setResult({
        kind: "error",
        message: getFirebaseErrorMessage(
          error,
          "We could not send your enquiry. Please try again."
        ),
      })
    }
  }

  return (
    <form
      className={cn("space-y-5", className)}
      onSubmit={form.handleSubmit(submitForm)}
      noValidate
    >
      <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-name" className="text-sm font-medium">
            Name <span aria-hidden="true">*</span>
          </label>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="contact-name-error" message={errors.name?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-phone" className="text-sm font-medium">
            Phone <span aria-hidden="true">*</span>
          </label>
          <Input
            id="contact-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
            {...register("phone")}
          />
          <FieldError id="contact-phone-error" message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contact-email" className="text-sm font-medium">
            Email <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="contact-email-error" message={errors.email?.message} />
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-service" className="text-sm font-medium">
            Service <span className="text-muted-foreground">(optional)</span>
          </label>
          <select
            id="contact-service"
            aria-invalid={Boolean(errors.service)}
            aria-describedby={errors.service ? "contact-service-error" : undefined}
            className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            {...register("service")}
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <FieldError
            id="contact-service-error"
            message={errors.service?.message}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-message" className="text-sm font-medium">
          Project details <span aria-hidden="true">*</span>
        </label>
        <Textarea
          id="contact-message"
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          placeholder="Tell us about the site, spaces, timeline, or help you need."
          className="min-h-36"
          {...register("message")}
        />
        <FieldError id="contact-message-error" message={errors.message?.message} />
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <Controller
            control={form.control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id="contact-consent"
                name={field.name}
                checked={field.value}
                onBlur={field.onBlur}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={
                  errors.consent ? "contact-consent-error" : undefined
                }
              />
            )}
          />
          <label htmlFor="contact-consent" className="text-sm leading-5">
            I agree that SKETCHPLAN may contact me about this enquiry. <span aria-hidden="true">*</span>
          </label>
        </div>
        <FieldError
          id="contact-consent-error"
          message={errors.consent?.message}
        />
      </div>

      {result && (
        <Alert
          variant={result.kind === "error" ? "destructive" : "default"}
          aria-live="polite"
        >
          {result.kind === "success" && <CheckCircle2Icon aria-hidden="true" />}
          <AlertTitle>
            {result.kind === "success" ? "Enquiry sent" : "Unable to send"}
          </AlertTitle>
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-36">
        {isSubmitting && (
          <LoaderCircleIcon aria-hidden="true" className="animate-spin" />
        )}
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  )
}

export { ContactForm, type ContactFormProps }
