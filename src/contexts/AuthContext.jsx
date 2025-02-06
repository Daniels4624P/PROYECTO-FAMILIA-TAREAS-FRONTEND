import { createContext, useContext, useState, useEffect } from "react"
import api from "../api"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.loginUser({ email, password })
      const token = response.data.token
      const user = response.data.user
      localStorage.setItem("token", token)
      setUser(user)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
      return user
    } catch (error) {
      console.error("Error in login:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    api.defaults.headers.common["Authorization"] = undefined
  }

  const registerAndLogin = async (name, email, password) => {
    try {
      const registerResponse = await api.registerUser({ name, email, password })
      if (registerResponse.data.token) {
        const loginResponse = await api.loginUser({ email, password })
        const token = loginResponse.data.token
        const user = loginResponse.data.user
        localStorage.setItem("token", token)
        setUser(user)
        return user
      }
    } catch (error) {
      console.error("Error in registerAndLogin:", error)
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, registerAndLogin }}>{children}</AuthContext.Provider>
}
