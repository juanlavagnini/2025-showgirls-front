import balanceService, { BalanceResponse } from '@/services/balance.service'
import { useQuery } from '@tanstack/react-query'

const defaultBalance: BalanceResponse = {
  balance: 0,
  sumaIngresos: 0,
  sumaGastos: 0,
}

export default function useBalance(userId: string) {
  const {
    data: balanceData = defaultBalance,
    refetch,
    isLoading,
    ...rest
  } = useQuery({
    queryKey: ['balance', userId],
    queryFn: () => balanceService.findByUserId(),
    select: (response) => response.data,
    enabled: !!userId,
    refetchOnMount: false,
  })

  return { balanceData, refetch, isLoading, ...rest }
}
