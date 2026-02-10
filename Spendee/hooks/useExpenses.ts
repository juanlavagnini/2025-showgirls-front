import expenseService, { ExpenseResponse } from '@/services/expense.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const defaultExpenses: ExpenseResponse[] = []

export interface ExpenseFilters {
  limit?: number
  order?: 'asc' | 'desc'
  month?: number
  year?: number
  categoryId?: number
}

export default function useExpenses(
  userId: string,
  filters: ExpenseFilters = {},
) {
  const queryClient = useQueryClient()

  function onMutationSuccess() {
    queryClient.invalidateQueries({ queryKey: ['expenses', userId] })
    queryClient.invalidateQueries({ queryKey: ['expenses', userId, filters] })
    queryClient.invalidateQueries({ queryKey: ['expensesByCategory', userId] })
    queryClient.invalidateQueries({ queryKey: ['balance', userId] })
    queryClient.invalidateQueries({ queryKey: ['categoriesChart'] })
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['budgets', userId] })
    queryClient.invalidateQueries({ queryKey: ['budgetDetail'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['streak', userId] })
  }

  const {
    data: expensesData = defaultExpenses,
    refetch,
    isLoading,
    ...rest
  } = useQuery<ExpenseResponse[]>({
    queryKey: ['expenses', userId, filters],
    queryFn: async () => {
      const res = await expenseService.findByUserId(userId, filters)
      return res.data
    },
    enabled: !!userId,
  })

  const { mutateAsync: addExpense } = useMutation({
    mutationFn: (body: any) => expenseService.create(body),
    onSuccess: onMutationSuccess,
  })

  const { mutateAsync: deleteExpense } = useMutation({
    mutationFn: (expenseId: number) => expenseService.deleteExpense(expenseId),
    onSuccess: onMutationSuccess,
  })

  const { mutateAsync: moveExpenses } = useMutation({
    mutationFn: async (categoryId: number) => {
      await expenseService.moveExpenses(categoryId, 7)
    },
    onSuccess: onMutationSuccess,
  })

  return {
    expensesData,
    refetch,
    addExpense,
    deleteExpense,
    moveExpenses,
    isLoading,
    ...rest,
  }
}
