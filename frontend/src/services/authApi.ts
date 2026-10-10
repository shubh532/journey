import axiosInstance from './axiosInstance'
import { toApiError } from './apiError'

export type CurrentUser = {
  id: string
  fullName: string
  email: string
}

export const authApi = {
  async register(fullName: string, email: string, password: string) {
    try {
      const { data } = await axiosInstance.post<CurrentUser>(
        '/api/auth/register',
        { fullName, email, password },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async login(email: string, password: string) {
    try {
      const { data } = await axiosInstance.post<CurrentUser>(
        '/api/auth/login',
        { email, password },
      )
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async logout() {
    try {
      await axiosInstance.post('/api/auth/logout')
    } catch (error) {
      throw toApiError(error)
    }
  },

  async me() {
    try {
      const { data } = await axiosInstance.get<CurrentUser>('/api/auth/me')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },
}
