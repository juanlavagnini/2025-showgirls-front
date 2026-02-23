import ApiService from './api.service'

export interface CategoryResponse {
  id: number
  usuarioId: string
  nombre: string
  icono: string
  color: string
  descripcion: string
  totalGastos: number
  editable: boolean
}

class CategoryService {
  public async findMany(params?: { month?: number; year?: number }) {
    const queryParams = new URLSearchParams()

    if (params?.month) {
      queryParams.append('month', String(params.month))
    }

    if (params?.year) {
      queryParams.append('year', String(params.year))
    }

    const queryString = queryParams.toString()

    return await ApiService.get<CategoryResponse[]>(
      queryString ? `/categories?${queryString}` : `/categories`,
    )
  }
  public async create(category: {
    nombre: string
    icono: string
    color: string
    descripcion: string
  }) {
    // Added leading slash to ensure correct URL concatenation with baseUrl
    return await ApiService.post(`/categories/customCategory`, category)
  }
  public async delete(categoryId: number) {
    console.log('CategoryId typeof', typeof categoryId);
    // Added leading slash for consistency
    return await ApiService.delete(`/categories/delete/${categoryId}`)
  }

  public async update(
    categoryId: number,
    body: {
      categoria: string
      descripcion: string
      icono: string
      color: string
    },
  ) {
    // Endpoint sin prefijo /categories según uso actual en la pantalla de edición
    return await ApiService.put(`/categories/modify/${categoryId}`, body)
  }

  public async getAlerts(triggered?: boolean) {
    const params: Record<string, boolean> = {}
    if (triggered !== undefined) params.triggered = triggered

    const response = await ApiService.get<
      {
        categoria: CategoryResponse
        limiteAlerta: number
        gastadoAct: number
        montoPresupuestado: number
        alertaVista: boolean
      }[]
    >('/categories/alerts', { params })

    return response.data
  }

  public async markAlertsAsSeen() {
    return await ApiService.put('/categories/alerts/seen', {})
  }
}

const categoryService = new CategoryService()
export default categoryService
