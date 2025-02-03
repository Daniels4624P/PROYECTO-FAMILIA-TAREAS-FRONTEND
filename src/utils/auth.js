import { loginUser, registerUser } from "./api"

export const login = async (email, password) => {
  try {
    const response = await loginUser({ email, password })
    const { token, user } = response.data
    localStorage.setItem("token", token)
    return user
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const register = async (name, email, password) => {
  try {
    const response = await registerUser({ name, email, password })
    const { token, user } = response.data
    localStorage.setItem("token", token)
    return user
  } catch (error) {
    console.error("Register error:", error)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem("token")
}

export const isAuthenticated = () => {
  return !!localStorage.getItem("token")
}
