import axios from "axios"

const API_URL = "https://api-familia-tareas-node.onrender.com" // Reemplaza con la URL de tu API

// Función para obtener el token de las cookies
const getTokenFromCookies = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token' || name === 'accessToken') { // Ajusta el nombre según tu cookie
      return value;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Habilita el envío y recepción de cookies
})

api.interceptors.request.use((config) => {
  const token = getTokenFromCookies(); // Cambiado de localStorage a cookies
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (userData) => api.post("/auth/register", userData)
export const loginUser = (credentials) => api.post("/auth/login", credentials)
export const getUserProfile = () => api.get("/auth/profile")
export const getUser = (id) => api.get(`/users/${id}`)
export const getUserHistory = () => api.get(`/users/history`) // Removido token manual
export const getUserPoints = (id) => api.get(`/users/${id}/points`) // Removido token manual
export const getUsersPoints = () => api.get("/users/points");
export const createProject = (projectData) => api.post("/projects", projectData)
export const getPublicProjects = () => api.get("/projects/public")
export const getPrivateProjects = () => api.get("/projects/private")
export const getProject = (id) => api.get(`/projects/${id}`)
export const updateProject = (id, projectData) => api.patch(`/projects/${id}`, projectData)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const completeProject = (id) => api.post(`/projects/${id}/complete`)
export const createFolder = (folderData) => api.post("/folders", folderData)
export const getPublicFolders = () => api.get("/folders/public")
export const getPrivateFolders = () => api.get("/folders/private")
export const getFolder = (id) => api.get(`/folders/${id}`)
export const updateFolder = (id, folderData) => api.patch(`/folders/${id}`, folderData)
export const deleteFolder = (id) => api.delete(`/folders/${id}`)

export const createTask = async (taskData) => { // Removido token manual
  const token = getTokenFromCookies();
  return fetch("https://api-familia-tareas-node.onrender.com/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(taskData),
  }).then((res) => res.json());
};

export const getFolderTasks = (folderId) => api.get(`/folders/${folderId}/tasks`)

export const updateTask = (id, taskData) => { // Removido token manual
  const token = getTokenFromCookies();
  return fetch(`https://api-familia-tareas-node.onrender.com/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(taskData),
  }).then((res) => res.json())
}

export const deleteTask = (id) => { // Removido token manual
  const token = getTokenFromCookies();
  return fetch(`https://api-familia-tareas-node.onrender.com/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  }).then((res) => res.json())
}

export const completePublicTask = (id, numberRepeat) => // Removido token manual
  api.patch(
    `/tasks/${id}/complete/task/public`,
    numberRepeat
  )

export const completePrivateTask = (id) => // Removido token manual
  api.patch(
    `/tasks/${id}/complete/task/private`,
    {}
  )

export const fetchTasksForMonth = (year, month) => // Removido token manual
  api.get(`/tasks/monthly`, {
    params: { year, month }
  });

export const sendRecoveryEmail = (email) => api.post("/auth/recovery", { email })

export const changePassword = (token, newPassword) => api.post("/auth/change-password", { token, newPassword })

// Accounts
export const createAccount = (accountData) => {
  return api.post('/accounts', accountData);
};

export const getAccounts = () => {
  return api.get('/accounts');
};

export const getAccount = (id) => {
  return api.get(`/accounts/${id}`);
};

export const updateAccount = (id, accountData) => {
  return api.patch(`/accounts/${id}`, accountData);
};

export const deleteAccount = (id) => {
  return api.delete(`/accounts/${id}`);
};

// Expenses
export const createExpense = (expenseData) => {
  return api.post('/expenses', expenseData);
};

export const getExpenses = () => {
  return api.get('/expenses');
};

export const getExpense = (id) => {
  return api.get(`/expenses/${id}`);
};

export const updateExpense = (id, expenseData) => {
  return api.patch(`/expenses/${id}`, expenseData);
};

export const deleteExpense = (id) => {
  return api.delete(`/expenses/${id}`);
};

// Categories
export const createCategory = (categoryData) => {
  return api.post('/categories', categoryData);
};

export const getCategories = () => {
  return api.get('/categories');
};

// Finances
export const exportFinances = async (year, month, type) => {
    try {
      const token = getTokenFromCookies(); // Cambiado de localStorage a cookies
      const response = await axios.get(`${API_URL}/finances/export?year=${year}&month=${month}&type=${type}`, {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error("Error exporting finances:", error);
      throw error;
    }
  };

// Incomes
export const createIncome = (incomeData) => {
  return api.post('/incomes', incomeData);
};

export const getIncomes = () => {
  return api.get('/incomes');
};

export const getIncome = (id) => {
  return api.get(`/incomes/${id}`);
};

export const updateIncome = (id, incomeData) => {
  return api.patch(`/incomes/${id}`, incomeData);
};

export const deleteIncome = (id) => {
  return api.delete(`/incomes/${id}`);
};

export const getAccountStatistics = () => {
  return api.get("/accounts/statistics/of/user")
}

export default api;
