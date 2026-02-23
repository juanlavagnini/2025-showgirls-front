import ApiService from './api.service'

export interface StreakResponse {
  rachaActual: number
  lastActiveDate: string
  isInactive: boolean
}

class StreakService {
  public async findByUserId() {
    return await ApiService.get<StreakResponse>('/racha')
  }
}

const streakService = new StreakService()
export default streakService

