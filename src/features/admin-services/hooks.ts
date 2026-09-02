"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createAdminService,
  deleteAdminService,
  getAdminServiceById,
  getAdminServicesPage,
  isSafeDocumentId,
  normalizeAdminServicePageSize,
  updateAdminService,
  type AdminServiceCursor,
  type AdminServiceStatusFilter,
} from "@/features/admin-services/repository"
import { serviceQueryKeys } from "@/features/services/hooks"
import type { ServiceInput } from "@/types/service"

const adminServiceQueryKeys = {
  all: ["admin", "services"] as const,
  detail: (serviceId: string) =>
    [...adminServiceQueryKeys.all, "detail", serviceId] as const,
  list: (status: AdminServiceStatusFilter, page: number, pageSize: number) =>
    [...adminServiceQueryKeys.all, "list", status, page, pageSize] as const,
}

interface UseAdminServicesPageOptions {
  cursor?: AdminServiceCursor | null
  page?: number
  pageSize?: number
  status?: AdminServiceStatusFilter
}

function useAdminServicesPage(options: UseAdminServicesPageOptions = {}) {
  const status = options.status ?? "all"
  const page = Math.max(1, Math.floor(options.page ?? 1))
  const pageSize = normalizeAdminServicePageSize(options.pageSize)

  return useQuery({
    queryKey: adminServiceQueryKeys.list(status, page, pageSize),
    queryFn: () =>
      getAdminServicesPage({
        status,
        pageSize,
        cursor: options.cursor,
      }),
  })
}

function useAdminService(serviceId: string) {
  const normalizedId = serviceId.trim()

  return useQuery({
    queryKey: adminServiceQueryKeys.detail(normalizedId || "invalid"),
    queryFn: () => getAdminServiceById(normalizedId),
    enabled: isSafeDocumentId(normalizedId),
  })
}

function useInvalidateServices() {
  const queryClient = useQueryClient()

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminServiceQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: serviceQueryKeys.all }),
    ])
  }
}

function useCreateAdminService() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: (input: ServiceInput) => createAdminService(input),
    onSuccess: invalidateServices,
  })
}

function useUpdateAdminService() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: ({
      serviceId,
      input,
    }: {
      serviceId: string
      input: ServiceInput
    }) => updateAdminService(serviceId, input),
    onSuccess: invalidateServices,
  })
}

function useDeleteAdminService() {
  const invalidateServices = useInvalidateServices()

  return useMutation({
    mutationFn: (serviceId: string) => deleteAdminService(serviceId),
    onSuccess: invalidateServices,
  })
}

export {
  adminServiceQueryKeys,
  useAdminService,
  useAdminServicesPage,
  useCreateAdminService,
  useDeleteAdminService,
  useUpdateAdminService,
  type UseAdminServicesPageOptions,
}
