import ApiService from './api.service'

export interface BudgetCategoryResponse {
  categoriaId: number
  monto: number
  gastado: number
  porcentaje: number
  alerta?: number
}

export interface BudgetResponse {
  id: number
  usuarioId: string
  monto: number
  fechaInicio: Date
  fechaFin: Date
  PresupuestoCategoria: BudgetCategoryResponse[]
}

export interface BudgetGroupResponse {
  futureBudgets: BudgetResponse[]
  currentBudget: BudgetResponse
  pastBudgets: BudgetResponse[]
  allBudgetDates: Date[]
}

class BudgetService {
  public async createBudget(body: BudgetResponse) {
    return await ApiService.post('/budget', body)
  }
  public async getBudget(userId: string) {
    return await ApiService.get<BudgetGroupResponse>(
      `/budget?usuarioId=${userId}`,
    )
  }
  public async deleteBudget(budgetId: number) {
    return await ApiService.delete(`/budget/${budgetId}`)
  }
  public async modifyBudget(budgetId: number, body: Partial<BudgetResponse>) {
    return await ApiService.put(`/budget/${budgetId}`, body)
  }
  public async findByBudgetId(budgetId: number) {
    return await ApiService.get<BudgetResponse>(`/budget/${budgetId}`)
  }
}

const budgetService = new BudgetService()
export default budgetService
