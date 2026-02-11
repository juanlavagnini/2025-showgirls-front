import expenseService, { ExpenseResponse } from '@/services/expense.service'
import budgetService from '@/services/budget.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toastService } from '@/context/ToastContext'
import { Alert } from 'react-native'

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
    onSuccess: async (data, variables) => {
      onMutationSuccess()

      try {
        const res = await budgetService.getBudget(userId)
        const currentBudget = res.data.currentBudget

        if (currentBudget) {
          const categoryId = variables.categoriaId
          const budgetCategory = currentBudget.PresupuestoCategoria.find(
            (p) => p.categoriaId === categoryId,
          )

          if (
            budgetCategory &&
            budgetCategory.alerta &&
            budgetCategory.limiteAlerta
          ) {
            const gastoActual = budgetCategory.gastado
            const gastoAnterior = gastoActual - Number(variables.gasto)
            const porcentajeAnterior = (gastoAnterior / budgetCategory.monto) * 100
            console.log('Gasto anterior:', gastoAnterior)
            console.log('Porcentaje anterior:', porcentajeAnterior)
            console.log('Gasto actual:', gastoActual)
            console.log('Porcentaje actual:', budgetCategory.porcentaje)
            console.log('Límite de alerta:', budgetCategory.limiteAlerta)
            console.log(porcentajeAnterior < budgetCategory.limiteAlerta &&
              budgetCategory.porcentaje >= budgetCategory.limiteAlerta)
            if (
              porcentajeAnterior < budgetCategory.limiteAlerta &&
              budgetCategory.porcentaje >= budgetCategory.limiteAlerta
            ) {
              Alert.alert(
                '¡Cuidado con tus gastos!',
                `Has alcanzado el ${budgetCategory.porcentaje.toFixed(0)}% del límite (${budgetCategory.limiteAlerta}%) en esta categoría`,
                [{ text: 'Entendido' }],
              )
            }
          }
        }
      } catch (error) {
        console.log('Error checking budget alert:', error)
      }
    },
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
