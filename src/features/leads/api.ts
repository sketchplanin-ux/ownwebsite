import { addDoc, collection, serverTimestamp } from "firebase/firestore"

import { COLLECTIONS } from "@/firebase/collections"
import { firestore } from "@/firebase/config"
import { logFirebaseError, mapFirebaseError } from "@/firebase/errors"
import {
  leadSubmissionSchema,
  type LeadSubmissionValues,
} from "@/features/leads/schema"

async function createLead(input: LeadSubmissionValues): Promise<string> {
  const parsed = leadSubmissionSchema.parse(input)
  const payload = {
    name: parsed.name,
    phone: parsed.phone,
    ...(parsed.email ? { email: parsed.email } : {}),
    ...(parsed.service ? { service: parsed.service } : {}),
    message: parsed.message,
    source: "website",
    status: "NEW",
    adminNotes: "",
    createdAt: serverTimestamp(),
  } as const

  try {
    const documentReference = await addDoc(
      collection(firestore, COLLECTIONS.leads),
      payload
    )
    return documentReference.id
  } catch (error) {
    logFirebaseError("Create public lead", error)
    throw mapFirebaseError(
      error,
      "We could not send your enquiry. Please try again."
    )
  }
}

export { createLead }
