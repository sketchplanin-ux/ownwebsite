import {
  deleteField,
  orderBy,
  where,
  type DocumentData,
  type FieldValue,
  type QueryDocumentSnapshot,
  type UpdateData,
} from "firebase/firestore"

import { COLLECTIONS } from "@/firebase/collections"
import {
  createDocument,
  readCollection,
  readDocument,
  readPaginatedCollection,
  removeDocument,
  updateDocument,
} from "@/firebase/firestore"
import type { Service, ServiceInput } from "@/types/service"

type ServiceDocument = Omit<Service, "id">

type AdminServiceStatusFilter = "all" | "draft" | "published"
type AdminServiceCursor = QueryDocumentSnapshot<DocumentData>

interface AdminServicesPageOptions {
  cursor?: AdminServiceCursor | null
  pageSize?: number
  status?: AdminServiceStatusFilter
}

interface AdminServicesPage {
  hasMore: boolean
  items: Service[]
  nextCursor: AdminServiceCursor | null
}

const DEFAULT_ADMIN_SERVICE_PAGE_SIZE = 12
const MAX_ADMIN_SERVICE_PAGE_SIZE = 25

class AdminServiceConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AdminServiceConflictError"
  }
}

function normalizeAdminServicePageSize(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_ADMIN_SERVICE_PAGE_SIZE
  }

  return Math.min(
    MAX_ADMIN_SERVICE_PAGE_SIZE,
    Math.max(1, Math.floor(value))
  )
}

function isSafeDocumentId(value: string) {
  const trimmed = value.trim()
  return (
    trimmed.length > 0 &&
    trimmed.length <= 256 &&
    !trimmed.includes("/") &&
    !/[\u0000-\u001f\u007f]/.test(trimmed)
  )
}

async function getAdminServicesPage(
  options: AdminServicesPageOptions = {}
): Promise<AdminServicesPage> {
  const status = options.status ?? "all"
  const constraints = [
    ...(status === "all"
      ? []
      : [where("published", "==", status === "published")]),
    orderBy("displayOrder", "asc"),
  ]
  const result = await readPaginatedCollection<ServiceDocument>(
    COLLECTIONS.services,
    {
      constraints,
      cursor: options.cursor,
      pageSize: normalizeAdminServicePageSize(options.pageSize),
    }
  )

  return {
    items: result.items,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore,
  }
}

async function getAdminServiceById(serviceId: string) {
  const normalizedId = serviceId.trim()
  if (!isSafeDocumentId(normalizedId)) {
    return null
  }

  return readDocument<ServiceDocument>(COLLECTIONS.services, normalizedId)
}

async function isServiceSlugAvailable(slug: string, excludeId?: string) {
  const normalizedSlug = slug.trim()
  if (!normalizedSlug) {
    return false
  }

  const matches = await readCollection<ServiceDocument>(COLLECTIONS.services, {
    constraints: [where("slug", "==", normalizedSlug)],
    maxResults: 2,
  })

  return matches.every((service) => service.id === excludeId)
}

async function createAdminService(input: ServiceInput) {
  if (!(await isServiceSlugAvailable(input.slug))) {
    throw new AdminServiceConflictError(
      "Another service already uses this slug. Choose a different slug."
    )
  }
  return createDocument<ServiceInput>(COLLECTIONS.services, input)
}

function createServiceUpdateData(
  input: ServiceInput,
  deleteValue: FieldValue = deleteField()
): UpdateData<ServiceDocument> {
  return {
    ...input,
    imagePublicId: input.imagePublicId ?? deleteValue,
    icon: input.icon ?? deleteValue,
    features: input.features ?? deleteValue,
    metaTitle: input.metaTitle ?? deleteValue,
    metaDescription: input.metaDescription ?? deleteValue,
  }
}

async function updateAdminService(serviceId: string, input: ServiceInput) {
  if (!isSafeDocumentId(serviceId)) {
    throw new Error("The service identifier is invalid.")
  }

  if (!(await isServiceSlugAvailable(input.slug, serviceId))) {
    throw new AdminServiceConflictError(
      "Another service already uses this slug. Choose a different slug."
    )
  }

  await updateDocument<ServiceDocument>(
    COLLECTIONS.services,
    serviceId,
    createServiceUpdateData(input)
  )
}

async function deleteAdminService(serviceId: string) {
  if (!isSafeDocumentId(serviceId)) {
    throw new Error("The service identifier is invalid.")
  }

  // This removes only the Firestore document. R2 object deletion requires a
  // secret-backed server operation and is intentionally not attempted here.
  await removeDocument(COLLECTIONS.services, serviceId)
}

export {
  AdminServiceConflictError,
  DEFAULT_ADMIN_SERVICE_PAGE_SIZE,
  MAX_ADMIN_SERVICE_PAGE_SIZE,
  createAdminService,
  createServiceUpdateData,
  deleteAdminService,
  getAdminServiceById,
  getAdminServicesPage,
  isSafeDocumentId,
  isServiceSlugAvailable,
  normalizeAdminServicePageSize,
  updateAdminService,
  type AdminServiceCursor,
  type AdminServicesPage,
  type AdminServicesPageOptions,
  type AdminServiceStatusFilter,
}
