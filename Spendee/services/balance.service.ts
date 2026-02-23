import { MovementsFilters } from '@/hooks/useMovements'
import ApiService from './api.service'

export interface BalanceResponse {
  balance: number
  sumaIngresos: number
  sumaGastos: number
}

export interface MovementsItem {
  usuarioId: string
  monto: number
  montoAnterior: number
  fecha: Date
  id: number
  categoriaId: number | null
  tipo: string
}

export interface MovementsResponse {
  period: string
  items: MovementsItem[]
  totalEgresos: number
  totalIngresos: number
}

class BalanceService {
  public async findByUserId() {
    return await ApiService.get<BalanceResponse>('/balance')
  }

  public async findMovements(filters: MovementsFilters) {
    return await ApiService.get<MovementsResponse[]>('/balance/agrupado', {
      params: { ...filters },
    })
  }
}

const balanceService = new BalanceService()
export default balanceService