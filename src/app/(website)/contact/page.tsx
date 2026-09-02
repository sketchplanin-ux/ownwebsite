import type { Metadata } from "next"

import { SectionHeading } from "@/components/website/section-heading"
import { ContactPageContent } from "@/features/leads/contact-page-content"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact SKETCHPLAN to discuss architecture, interior design, renovation, or planning work.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "Contact | SKETCHPLAN",
    description:
      "Start a conversation with SKETCHPLAN about your architecture or interior design project.",
    url: "/contact/",
    type: "website",
  },
}

export default function ContactPage() {
  return (
    <>
      <section className="border-b bg-muted/30 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            headingLevel={1}
            eyebrow="Contact"
            title="Let’s shape the next idea"
            description="Tell us what you are planning—from a new building or interior to a renovation or approval-ready plan."
          />
        </div>
      </section>

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <ContactPageContent />
        </div>
      </section>
    </>
  )
}
