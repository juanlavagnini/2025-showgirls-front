import budgetService, {
  BudgetGroupResponse,
  BudgetResponse,
} from '@/services/budget.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export default function useBudgets(usuarioId: string) {
  const queryClient = useQueryClient()

  function onMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: ['budgets'] })
    queryClient.invalidateQueries({ queryKey: ['budgetDetail'] })
    queryClient.invalidateQueries({ queryKey: ['expenses'], exact: false })
    queryClient.invalidateQueries({
      queryKey: ['expensesByCategory'],
      exact: false,
    })
    queryClient.invalidateQueries({
      queryKey: ['categoriesChart'],
      exact: false,
    })
    queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['streak'], exact: false })
  }

  const {
    data: budgetsData,
    isLoading,
    refetch,
    ...rest
  } = useQuery<BudgetGroupResponse>({
    queryKey: ['budgets', usuarioId],
    queryFn: async () => {
      const res = await budgetService.getBudget(usuarioId)
      return res.data
    },
  })
  const { mutateAsync: addBudget } = useMutation({
    mutationFn: (body: any) => budgetService.createBudget(body),
    onSuccess: onMutationSuccess,
  })
  const { mutateAsync: deleteBudget } = useMutation({
    mutationFn: (budgetId: number) => budgetService.deleteBudget(budgetId),
    onSuccess: onMutationSuccess,
  })
  const { mutateAsync: modifyBudget } = useMutation({
    mutationFn: async ({
      budgetId,
      body,
    }: {
      budgetId: number
      body: Partial<BudgetResponse>
    }) => {
      return budgetService.modifyBudget(budgetId, body)
    },
    onSuccess: (data, variables) => {
      const { budgetId } = variables
      onMutationSuccess()
      queryClient.invalidateQueries({ queryKey: ['budgetDetail', budgetId] })
    },
  })
  const { mutateAsync: modifyBudgetCategory } = useMutation({
    mutationFn: async ({
      budgetId,
      categoryId,
      body,
    }: {
      budgetId: number
      categoryId: number
      body: { monto?: number; alerta?: boolean; limiteAlerta?: number }
    }) => {
      return budgetService.modifyBudgetCategory(budgetId, categoryId, body)
    },
    onSuccess: (data, variables) => {
      onMutationSuccess()
    },
  })
  return {
    futureBudgets: budgetsData?.futureBudgets,
    currentBudget: budgetsData?.currentBudget,
    pastBudgets: budgetsData?.pastBudgets,
    budgetDates: budgetsData?.allBudgetDates.map((date) => new Date(date)),
    isLoading,
    refetch,
    addBudget,
    deleteBudget,
    modifyBudget,
    modifyBudgetCategory,
    ...rest,
  }
}
