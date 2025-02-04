import axios from "axios"

const API_URL = "http://localhost:3000" // Reemplaza con la URL de tu API

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const registerUser = (userData) => api.post("/auth/register", userData)
export const loginUser = (credentials) => api.post("/auth/login", credentials)
export const getUserProfile = () => api.get("/auth/profile")
export const getUser = (id) => api.get(`/users/${id}`)
export const getUserHistory = (token) => api.get(`/users/history`, {}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
export const getUserPoints = (id, token) => api.get(`/users/${id}/points`, {}, {
  headers: {
    Authorization: `Bearer ${token}`
  }})
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
export const createTask = async (taskData, token) => {
  return fetch("http://localhost:3000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Envío del JWT
    },
    body: JSON.stringify(taskData),
  }).then((res) => res.json());
};
export const getFolderTasks = (folderId) => api.get(`/folders/${folderId}/tasks`)
export const updateTask = (id, taskData, token) => {
  return fetch(`http://localhost:3000/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(taskData),
  }).then((res) => res.json())
}

export const deleteTask = (id, token) => {
  return fetch(`http://localhost:3000/tasks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())
}
export const completeTask = (id, token) => 
  api.patch(`/tasks/${id}/complete`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export default api
