"use client"

import { createContext, useState, useContext, useEffect, useCallback, useRef } from "react"
import { login, register, logout } from "../utils/auth"
import { useNavigate, useLocation } from "react-router-dom"
import { setAuthContextUpdater } from "../utils/api"
import Loader from "../components/Loader"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const userRef = useRef(null)

  // Función para actualizar el usuario (será llamada directamente desde el interceptor)
  const updateUser = useCallback(
    (userData) => {
      console.log("🔄 Direct user update called:", userData)

      if (userData) {
        console.log("✅ Setting user data:", userData)
        setUser(userData)
        userRef.current = userData

        if (!authChecked) {
          setAuthChecked(true)
        }
      } else {
        console.log("🧹 Clearing user data")
        setUser(null)
        userRef.current = null
      }
    },
    [authChecked],
  )

  // Registrar la función de actualización en el interceptor
  useEffect(() => {
    console.log("🔧 Registering auth context updater...")
    setAuthContextUpdater(updateUser)
    console.log("✅ Auth context updater registered")
  }, [updateUser])

  // Función para verificar el estado de autenticación
  const checkAuthStatus = useCallback(async (skipRedirect = false) => {
    try {
      console.log("🔍 Checking auth status...")
      const { getUserProfile } = await import("../utils/api")
      const response = await getUserProfile({ skipAuthRefresh: true })
      if (response.data) {
        console.log("✅ User authenticated:", response.data)
        setUser(response.data)
        userRef.current = response.data
        return true
      } else {
        console.log("❌ No user data in response")
        setUser(null)
        userRef.current = null
        return false
      }
    } catch (error) {
      console.log("❌ No active session:", error.response?.status || error.message)
      setUser(null)
      userRef.current = null
      return false
    }
  }, [])

  // Efecto para la verificación inicial de autenticación
  useEffect(() => {
    if (authChecked) return

    const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/password-recovery", "/recovery"]
    const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith("/recovery")

    const initAuth = async () => {
      console.log("🚀 Initializing auth check for route:", location.pathname)

      if (isPublicRoute) {
        console.log("🌐 Public route detected, checking auth without redirect")
        await checkAuthStatus(true)
        setLoading(false)
        setAuthChecked(true)
        return
      }

      console.log("🔒 Protected route detected, checking auth with potential redirect")
      const isAuthenticated = await checkAuthStatus()
      if (!isAuthenticated && !isPublicRoute) {
        console.log("🔄 Not authenticated, redirecting to home")
        navigate("/")
      }

      setLoading(false)
      setAuthChecked(true)
    }

    initAuth()
  }, [authChecked, location.pathname, navigate, checkAuthStatus])

  // Efecto para escuchar eventos de refresh (como respaldo)
  useEffect(() => {
    const handleAuthRefreshSuccess = (event) => {
      console.log("✅ Auth refresh success event received:", event.detail)
      if (event.detail?.user) {
        console.log("🔄 Updating user from event...")
        updateUser(event.detail.user)

        // Forzar un re-render para asegurar que la UI se actualice
        setTimeout(() => {
          console.log("🔄 Forcing UI update after auth refresh")
        }, 50)
      }
    }

    const handleAuthRefreshFailed = (event) => {
      console.log("❌ Auth refresh failed event:", event.detail)
      updateUser(null)

      // Solo redirigir si no estamos en una ruta pública
      const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/password-recovery", "/recovery"]
      const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith("/recovery")

      if (!isPublicRoute) {
        console.log("🔄 Redirecting to home due to auth failure")
        navigate("/")
      }
    }

    console.log("👂 Setting up event listeners...")
    window.addEventListener("auth-refresh-success", handleAuthRefreshSuccess)
    window.addEventListener("auth-refresh-failed", handleAuthRefreshFailed)

    return () => {
      console.log("🧹 Cleaning up event listeners...")
      window.removeEventListener("auth-refresh-success", handleAuthRefreshSuccess)
      window.removeEventListener("auth-refresh-failed", handleAuthRefreshFailed)
    }
  }, [updateUser, location.pathname, navigate])

  // Login
  const authLogin = async (email, password) => {
    try {
      const userData = await login(email, password)

      if (!userData) {
        throw new Error("No user data received from login")
      }

      console.log("✅ Login successful, setting user:", userData)
      setUser(userData)
      userRef.current = userData
      setAuthChecked(true)

      return userData
    } catch (error) {
      console.error("❌ Login failed:", error)
      setUser(null)
      userRef.current = null
      throw error
    }
  }

  // Register
  const authRegister = async (name, email, password) => {
    try {
      const userData = await register(name, email, password)

      if (!userData) {
        throw new Error("No user data received from register")
      }

      console.log("✅ Register successful, setting user:", userData)
      setUser(userData)
      userRef.current = userData
      setAuthChecked(true)
      return userData
    } catch (error) {
      console.error("❌ Register failed:", error)
      setUser(null)
      userRef.current = null
      throw error
    }
  }

  // Logout
  const authLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("❌ Logout error:", error)
    } finally {
      console.log("🧹 Clearing user state")
      setUser(null)
      userRef.current = null
      navigate("/")
    }
  }

  // Función para obtener el estado de autenticación actual
  const isAuthenticated = user !== null

  // Debug log para cambios en el estado del usuario
  useEffect(() => {
    console.log("👤 User state changed:", {
      isAuthenticated,
      user: user ? { id: user.id, name: user.name } : null,
      timestamp: new Date().toISOString(),
    })
  }, [user, isAuthenticated])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-notion-bg dark:bg-notion-dark">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login: authLogin,
        register: authRegister,
        logout: authLogout,
        setUser,
        checkAuthStatus,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
