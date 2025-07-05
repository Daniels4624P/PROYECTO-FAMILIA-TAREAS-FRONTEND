import axios from "axios"

const API_URL = "http://localhost:3000"

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Variable para evitar múltiples intentos de refresh simultáneos
let isRefreshing = false
let failedQueue = []

// Variable global para almacenar la función de actualización del contexto
let updateAuthContext = null

// Función para registrar el callback del contexto
export const setAuthContextUpdater = (updaterFunction) => {
  updateAuthContext = updaterFunction
  console.log("🔧 Auth context updater registered")
}

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// Interceptor de respuesta para manejar errores de autenticación y refresh automático
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    console.log("🚨 Interceptor triggered:", {
      status: error.response?.status,
      url: originalRequest?.url,
      baseURL: originalRequest?.baseURL,
      fullURL: `${originalRequest?.baseURL || API_URL}${originalRequest?.url}`,
      retry: originalRequest?._retry,
    })

    // Solo hacer refresh si es 401 y no hemos intentado antes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register")
    ) {
      console.log("🔄 Token expired, attempting refresh...")

      if (isRefreshing) {
        console.log("⏳ Already refreshing, adding to queue")
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            console.log("🔄 Retrying queued request after refresh completed")
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.log("🔄 Step 1: Making refresh request to /auth/refresh...")
        console.log("🔄 Full refresh URL:", `${API_URL}/auth/refresh`)

        // PASO 1: Refresh del token - con más debugging
        const refreshResponse = await api.post("/auth/refresh")
        console.log("✅ Step 1 completed: Token refresh successful:", {
          status: refreshResponse.status,
          statusText: refreshResponse.statusText,
          headers: refreshResponse.headers,
        })

        // PASO 2: Obtener el perfil actualizado y actualizar contexto
        console.log("🔄 Step 2: Fetching updated user profile...")
        const profileResponse = await api.get("/auth/profile", { skipAuthRefresh: true })

        if (profileResponse.data) {
          console.log("✅ Step 2 completed: Profile fetched successfully:", profileResponse.data)

          // PASO 3: Actualizar el contexto y esperar a que se complete
          console.log("🔄 Step 3: Updating auth context...")
          if (updateAuthContext && typeof updateAuthContext === "function") {
            updateAuthContext(profileResponse.data)
            console.log("✅ Step 3 completed: Auth context updated")
          }

          // PASO 4: Disparar evento y dar tiempo para que se procese
          if (typeof window !== "undefined") {
            console.log("🔄 Step 4: Dispatching auth refresh event...")
            const authRefreshEvent = new CustomEvent("auth-refresh-success", {
              detail: {
                user: profileResponse.data,
                timestamp: Date.now(),
              },
            })
            window.dispatchEvent(authRefreshEvent)

            // Dar un pequeño delay para que el evento se procese
            await new Promise((resolve) => setTimeout(resolve, 100))
            console.log("✅ Step 4 completed: Event dispatched and processed")
          }
        }

        // PASO 5: Procesar la cola de peticiones pendientes
        console.log("🔄 Step 5: Processing queued requests...")
        processQueue(null)
        isRefreshing = false
        console.log("✅ Step 5 completed: Queue processed")

        // PASO 6: Reintentar la petición original
        console.log("🔄 Step 6: Retrying original request:", originalRequest.url)
        const retryResponse = await api(originalRequest)
        console.log("✅ Step 6 completed: Original request successful")

        return retryResponse
      } catch (refreshError) {
        console.error("❌ Token refresh process failed:", {
          status: refreshError.response?.status,
          statusText: refreshError.response?.statusText,
          message: refreshError.message,
          url: refreshError.config?.url,
          fullURL: `${refreshError.config?.baseURL || API_URL}${refreshError.config?.url}`,
          data: refreshError.response?.data,
        })

        processQueue(refreshError)
        isRefreshing = false

        // Si es 404, significa que la ruta no existe o el servidor no está disponible
        if (refreshError.response?.status === 404) {
          console.error("🚨 CRITICAL: Refresh endpoint not found! Check if backend is running and route exists")
          console.error("🚨 Expected URL:", `${API_URL}/auth/refresh`)
        }

        // Solo limpiar contexto si realmente falló el refresh (401/403)
        if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
          console.log("🧹 Clearing auth context due to auth failure")
          if (updateAuthContext && typeof updateAuthContext === "function") {
            updateAuthContext(null)
          }

          // Disparar evento de fallo
          if (typeof window !== "undefined") {
            const authFailEvent = new CustomEvent("auth-refresh-failed", {
              detail: { error: refreshError },
            })
            window.dispatchEvent(authFailEvent)
          }
        } else if (refreshError.response?.status === 404) {
          // Para 404, no limpiar el contexto, solo loggear el error
          console.error("🚨 Backend endpoint not available, keeping current auth state")
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// Auth endpoints
export const registerUser = (userData) => api.post("/auth/register", userData)
export const loginUser = (credentials) => api.post("/auth/login", credentials)
export const logoutUser = () => api.delete("/auth/logout")
export const getUserProfile = (config = {}) => {
  const requestConfig = { ...config }
  if (config.skipAuthRefresh) {
    requestConfig.skipAuthRefresh = true
    delete requestConfig.skipAuthRefresh
  }
  return api.get("/auth/profile", requestConfig)
}

// Profile endpoints - CHANGED: Updated to use /auth/profile
export const updateProfile = (profileData) => api.patch("/auth/profile", profileData)

// Google OAuth endpoints
export const getGoogleAuthUrl = () => api.get("/auth/google/handler")
export const handleGoogleCallback = (state, code) => api.get(`/auth/google/callback?state=${state}&code=${code}`)

// Google Calendar authorization endpoints
export const getGoogleCalendarAuthUrl = () => api.get("/tasks/google/handler")

// NEW: Check Google Calendar access status from backend
export const checkGoogleCalendarAccess = () => api.get("/auth/google-calendar-status")

// X (Twitter) OAuth endpoints
export const getXAuthUrl = () => api.get("/auth/x/handler")
export const handleXCallback = (state, code) => api.get(`/auth/x/callback?state=${state}&code=${code}`)

// User endpoints
export const getUser = (id) => api.get(`/users/${id}`)
export const getUserHistory = () => api.get(`/users/history`)
export const getUserPoints = (id) => api.get(`/users/${id}/points`)
export const getUsersPoints = () => api.get("/users/points")

// Project endpoints
export const createProject = (projectData) => api.post("/projects", projectData)
export const getPublicProjects = () => api.get("/projects/public")
export const getPrivateProjects = () => api.get("/projects/private")
export const getProject = (id) => api.get(`/projects/${id}`)
export const updateProject = (id, projectData) => api.patch(`/projects/${id}`, projectData)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const completeProject = (id) => api.post(`/projects/${id}/complete`)

// Folder endpoints
export const createFolder = (folderData) => api.post("/folders", folderData)
export const getPublicFolders = () => api.get("/folders/public")
export const getPrivateFolders = () => api.get("/folders/private")
export const getFolder = (id) => api.get(`/folders/${id}`)
export const updateFolder = (id, folderData) => api.patch(`/folders/${id}`, folderData)
export const deleteFolder = (id) => api.delete(`/folders/${id}`)

// Task endpoints
export const createTask = (taskData) => {
  return api.post("/tasks", taskData)
}

export const getFolderTasks = (folderId) => api.get(`/folders/${folderId}/tasks`)

export const updateTask = (id, taskData) => {
  return api.patch(`/tasks/${id}`, taskData)
}

export const deleteTask = (id) => {
  return api.delete(`/tasks/${id}`)
}

export const completePublicTask = (id, token, taskData) => {
  return api.patch(`/tasks/${id}/complete/task/public`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const completePrivateTask = (id, token, taskData) => {
  return api.patch(`/tasks/${id}/complete/task/private`, taskData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const fetchTasksForMonth = (year, month) => {
  const params = {}

  if (month && month !== "undefined" && month !== undefined && month !== null && Number(month) > 1900) {
    if (!year || year === "undefined" || year === undefined || year === null) {
      params.year = Number(month)
      const currentMonth = new Date().getMonth() + 1
      params.month = String(currentMonth).padStart(2, "0")
    } else {
      params.year = Number(year)
      params.month = String(month).padStart(2, "0")
    }
  } else {
    if (year && year !== "undefined" && year !== undefined && year !== null) {
      params.year = Number(year)
    }
    if (month && month !== "undefined" && month !== undefined && month !== null && Number(month) <= 12) {
      params.month = String(month).padStart(2, "0")
    }
  }

  return api.get(`/tasks/tasks/monthly`, {
    params: params,
    paramsSerializer: {
      serialize: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (key === "month") {
            searchParams.append(key, String(value))
          } else {
            searchParams.append(key, value)
          }
        })
        return searchParams.toString()
      },
    },
  })
}

// Password recovery
export const sendRecoveryEmail = (email) => api.post("/auth/recovery", { email })
export const changePassword = (token, newPassword) => api.post("/auth/change-password", { token, newPassword })

// Account endpoints
export const createAccount = (accountData) => api.post("/accounts", accountData)
export const getAccounts = () => api.get("/accounts")
export const getAccount = (id) => api.get(`/accounts/${id}`)
export const updateAccount = (id, accountData) => api.patch(`/accounts/${id}`, accountData)
export const deleteAccount = (id) => api.delete(`/accounts/${id}`)

// Expense endpoints
export const createExpense = (expenseData) => api.post("/expenses", expenseData)
export const getExpenses = () => api.get("/expenses")
export const getExpense = (id) => api.get(`/expenses/${id}`)
export const updateExpense = (id, expenseData) => api.patch(`/expenses/${id}`, expenseData)
export const deleteExpense = (id) => api.delete(`/expenses/${id}`)

// Category endpoints
export const createCategory = (categoryData) => api.post("/categories", categoryData)
export const getCategories = () => api.get("/categories")

// Finance endpoints
export const exportFinances = async (year, month, type) => {
  try {
    const response = await api.get(`/finances/export?year=${year}&month=${month}&type=${type}`, {
      responseType: "blob",
    })
    return response
  } catch (error) {
    console.error("Error exporting finances:", error)
    throw error
  }
}

// Income endpoints
export const createIncome = (incomeData) => api.post("/incomes", incomeData)
export const getIncomes = () => api.get("/incomes")
export const getIncome = (id) => api.get(`/incomes/${id}`)
export const updateIncome = (id, incomeData) => api.patch(`/incomes/${id}`, incomeData)
export const deleteIncome = (id) => api.delete(`/incomes/${id}`)

export const getAccountStatistics = () => api.get("/accounts/statistics/of/user")

// Utility function to check if accessTokenGoogle cookie exists (fallback method)
export const hasGoogleCalendarAccess = () => {
  if (typeof document === 'undefined') return false
  
  const cookies = document.cookie.split(';')
  const hasAccessToken = cookies.some(cookie => {
    const [name, value] = cookie.trim().split('=')
    return name === 'accessTokenGoogle' && value && value !== 'undefined' && value !== 'null'
  })
  
  console.log('🔍 Checking Google Calendar access via cookies:', hasAccessToken)
  console.log('🍪 All cookies:', document.cookie)
  
  return hasAccessToken
}

export default api