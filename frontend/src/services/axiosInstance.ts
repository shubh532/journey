import axios from 'axios'

const SESSION_EXEMPT_PATHS = ['/api/auth/login', '/api/auth/register']

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !SESSION_EXEMPT_PATHS.includes(error.config?.url ?? '') &&
      window.location.pathname !== '/signin'
    ) {
      window.location.assign('/signin')
    }
    return Promise.reject(error)
  },
)

export default axiosInstance
