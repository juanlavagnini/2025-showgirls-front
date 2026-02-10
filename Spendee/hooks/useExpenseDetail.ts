import expenseService, { ExpenseResponse } from '@/services/expense.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const defaultExpense: ExpenseResponse = {
  id: 0,
  gasto: 0,
  montoAnterior: 0,
  fecha: new Date(),
  categoriaId: 0,
  usuarioId: '',
}

export default function useExpenseDetail(expenseId: number) {
  const queryClient = useQueryClient()
  const onMutationSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: ['expenseDetail'],
      exact: false,
    })
    queryClient.invalidateQueries({ queryKey: ['expenses'], exact: false })
    queryClient.invalidateQueries({
      queryKey: ['expensesByCategory'],
      exact: false,
    })
    queryClient.invalidateQueries({ queryKey: ['categories'], exact: false })
    queryClient.invalidateQueries({
      queryKey: ['categoriesChart'],
      exact: false,
    })
    queryClient.invalidateQueries({ queryKey: ['balance'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['budgets'], exact: false })
    queryClient.invalidateQueries({ queryKey: ['budgetDetail'], exact: false })
  }

  const {
    data: expenseDetailData = defaultExpense,
    refetch,
    isLoading,
    ...rest
  } = useQuery<ExpenseResponse>({
    queryKey: ['expenseDetail', expenseId],
    queryFn: async () => {
      const res = await expenseService.findByExpenseId(expenseId)
      return res.data
    },
    enabled: !!expenseId,
    refetchOnMount: false,
  })

  const { mutateAsync: updateExpense } = useMutation({
    mutationFn: (body: any) => expenseService.update(expenseId, body),
    onSuccess: onMutationSuccess,
  })

  const { mutateAsync: deleteExpense } = useMutation({
    mutationFn: expenseService.deleteExpense,
    onSuccess: onMutationSuccess,
  })

  return {
    expenseDetailData,
    updateExpense,
    deleteExpense,
    refetch,
    isLoading,
    ...rest,
  }
}
