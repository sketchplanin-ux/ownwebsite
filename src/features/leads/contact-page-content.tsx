"use client"

import { Clock3Icon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { GoogleMap } from "@/components/website/google-map"
import { DEFAULT_CONTACT_EMAIL } from "@/components/website/site-logo"
import { useContactPage } from "@/features/pages/hooks"
import { useGeneralSettings } from "@/features/settings/hooks"
import { ContactForm } from "@/features/leads/contact-form"
import {
  isSafeGoogleMapsEmbedUrl,
  normalizeWhatsAppNumber,
} from "@/lib/url"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ContactPageContent() {
  const { data: settings, isError: isSettingsError } = useGeneralSettings()
  const { data: pageContent, isError: isContentError } = useContactPage()
  const phone = settings?.phone?.trim() ?? ""
  const phoneDigits = normalizeWhatsAppNumber(phone)
  const configuredEmail = settings?.email?.trim() ?? ""
  const email = EMAIL_PATTERN.test(configuredEmail)
    ? configuredEmail
    : DEFAULT_CONTACT_EMAIL
  const address = settings?.address?.trim() ?? ""
  const officeHours = settings?.officeHours?.trim() ?? ""
  const mapUrl = settings?.googleMapsUrl?.trim() ?? ""
  const showMap = isSafeGoogleMapsEmbedUrl(mapUrl)
  const introduction =
    pageContent?.introduction?.trim() ||
    "Share what you are planning, and our team will respond with the next practical step."
  const formHeading =
    pageContent?.formHeading?.trim() || "Tell us about your project"
  const mapHeading = pageContent?.mapHeading?.trim() || "Find the studio"

  return (
    <div className="space-y-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <aside className="space-y-8 rounded-2xl bg-primary p-7 text-primary-foreground sm:p-9">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary-foreground/60 uppercase">
              Studio contact
            </p>
            <h2 className="mt-3 text-2xl font-semibold">Start a conversation</h2>
            <p className="mt-3 leading-7 text-primary-foreground/70">
              {introduction}
            </p>
          </div>

          <address className="space-y-5 not-italic">
            <a
              href={`mailto:${email}`}
              className="flex items-start gap-3 rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-foreground"
            >
              <MailIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span className="break-all">{email}</span>
            </a>
            {phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                {phoneDigits ? (
                  <a
                    href={`tel:${phoneDigits}`}
                    className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-foreground"
                  >
                    {phone}
                  </a>
                ) : (
                  <span>{phone}</span>
                )}
              </div>
            )}
            {address && (
              <div className="flex items-start gap-3">
                <MapPinIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                <span>{address}</span>
              </div>
            )}
            {officeHours && (
              <div className="flex items-start gap-3">
                <Clock3Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                <span>{officeHours}</span>
              </div>
            )}
          </address>

          {(isSettingsError || isContentError) && (
            <Alert className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              <AlertTitle>Some studio details are unavailable</AlertTitle>
              <AlertDescription className="text-primary-foreground/70">
                You can still email us or send the enquiry form.
              </AlertDescription>
            </Alert>
          )}
        </aside>

        <section aria-labelledby="contact-form-title" className="rounded-2xl border bg-card p-7 sm:p-9">
          <h2 id="contact-form-title" className="text-2xl font-semibold">
            {formHeading}
          </h2>
          <p className="mt-2 mb-7 text-sm leading-6 text-muted-foreground">
            Required fields are marked with an asterisk.
          </p>
          <ContactForm />
        </section>
      </div>

      {showMap && (
        <section aria-labelledby="studio-map-title" className="space-y-5">
          <div>
            <h2 id="studio-map-title" className="text-2xl font-semibold">
              {mapHeading}
            </h2>
            {address && <p className="mt-2 text-muted-foreground">{address}</p>}
          </div>
          <GoogleMap embedUrl={mapUrl} title="SKETCHPLAN studio location" />
        </section>
      )}
    </div>
  )
}

export { ContactPageContent }
