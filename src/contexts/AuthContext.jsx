"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { login, register, logout } from "../utils/auth"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const navigate = useNavigate() // Hook para redirección

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userName = localStorage.getItem("userName")
    if (token) {
      // Cargar el usuario con el token y el nombre si existen
      setUser({
        token,
        name: userName || "Usuario", // Usar "Usuario" como fallback si no hay nombre guardado
      })
    }
  }, [])

  const authLogin = async (email, password) => {
    const userData = await login(email, password)
    setUser(userData)

    // Guardar el nombre del usuario en localStorage
    if (userData && userData.name) {
      localStorage.setItem("userName", userData.name)
    }
  }

  const authRegister = async (name, email, password) => {
    const userData = await register(name, email, password)
    setUser(userData)

    // Guardar el nombre del usuario en localStorage
    if (userData && userData.name) {
      localStorage.setItem("userName", userData.name)
    }
  }

  const authLogout = () => {
    logout()
    // Eliminar el nombre del usuario del localStorage
    localStorage.removeItem("userName")
    setUser(null)
    navigate("/login") // Redirigir al login después del logout
  }

  return (
    <AuthContext.Provider value={{ user, login: authLogin, register: authRegister, logout: authLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

