import categoryService from '@/services/category.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function useAlerts() {
  const queryClient = useQueryClient()
  const {
    data: alertsData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => await categoryService.getAlerts(true),
  })

  const { mutate: markAsSeen } = useMutation({
    mutationFn: () => categoryService.markAlertsAsSeen(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const unseenCount =
    alertsData?.filter((alert) => !alert.alertaVista).length || 0

  return {
    alertsData,
    isLoading,
    isRefetching,
    refetch,
    markAsSeen,
    unseenCount,
  }
}
