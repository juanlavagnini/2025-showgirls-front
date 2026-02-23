import balanceService, { MovementsResponse } from '@/services/balance.service'
import { useQuery } from '@tanstack/react-query'

export interface MovementsFilters {
  startDate?: 'string'
  endDate?: 'string'
  groupBy?: 'day' | 'month' | 'year'
  order?: 'asc' | 'desc'
}

export default function useMovements(
  userId: string,
  filters: MovementsFilters,
) {
  const { data, ...rest } = useQuery<MovementsResponse[]>({
    queryKey: ['movements', userId, filters],
    queryFn: async () => (await balanceService.findMovements(filters)).data,
  })
  return { movementsData: data, ...rest }
}