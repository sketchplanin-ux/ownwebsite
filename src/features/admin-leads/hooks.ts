import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteLead,
  getAdminLeadPage,
  saveLeadUpdate,
  type AdminLeadPageOptions,
  type LeadUpdateInput,
} from "@/features/admin-leads/api";

const adminLeadKeys = {
  all: ["admin", "leads"] as const,
  page: (status: AdminLeadPageOptions["status"], cursorId: string) =>
    [...adminLeadKeys.all, "page", status ?? "ALL", cursorId] as const,
};

export function useAdminLeadPage(options: AdminLeadPageOptions) {
  const cursorId = options.cursor?.id ?? "first";

  return useQuery({
    queryKey: adminLeadKeys.page(options.status, cursorId),
    queryFn: () => getAdminLeadPage(options),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useSaveLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      values,
    }: {
      leadId: string;
      values: LeadUpdateInput;
    }) => saveLeadUpdate(leadId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminLeadKeys.all });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminLeadKeys.all });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard"],
      });
    },
  });
}
