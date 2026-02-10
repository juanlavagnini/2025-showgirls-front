import budgetService, { BudgetResponse } from '@/services/budget.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function useBudgetDetail(budgetId: number) {
  const queryClient = useQueryClient()
  function onMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: ['budgetDetail', budgetId] })
  }
  const {
    data: budgetDetailData,
    refetch,
    isLoading,
    ...rest
  } = useQuery<BudgetResponse>({
    queryKey: ['budgetDetail', budgetId],
    queryFn: async () => {
      const res = await budgetService.findByBudgetId(budgetId)
      return res.data
    },
    enabled: !!budgetId,
  })
  return {
    budgetDetailData,
    refetch,
    isLoading,
    ...rest,
  }
}
