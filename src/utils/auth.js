import { loginUser, registerUser, logoutUser } from "./api"

export const login = async (email, password) => {
  try {
    const response = await loginUser({ email, password })

    // Verificar diferentes estructuras posibles de respuesta
    let userData = null

    if (response.data?.user) {
      userData = response.data.user
    } else if (response.data && typeof response.data === "object" && response.data.name) {
      userData = response.data
    } else {
      console.error("No user data found in response:", response.data)
      throw new Error("No user data received from server")
    }

    if (!userData) {
      throw new Error("Invalid user data received")
    }

    return userData
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export const register = async (name, email, password) => {
  try {
    const response = await registerUser({ name, email, password })

    // Verificar diferentes estructuras posibles de respuesta
    let userData = null

    if (response.data?.user) {
      userData = response.data.user
    } else if (response.data && typeof response.data === "object" && response.data.name) {
      userData = response.data
    } else {
      console.error("No user data found in response:", response.data)
      throw new Error("No user data received from server")
    }

    if (!userData) {
      throw new Error("Invalid user data received")
    }

    return userData
  } catch (error) {
    console.error("Register error:", error)
    throw error
  }
}

export const logout = async () => {
  try {
    // Hacer logout en el servidor usando DELETE
    await logoutUser()
  } catch (error) {
    console.warn("Server logout failed, but continuing with local logout:", error.message)
    // No lanzar el error - el logout local debe funcionar aunque falle el servidor
  }

  // El logout local siempre debe funcionar
  // Las cookies se limpiarán automáticamente si el servidor responde correctamente
}

export const isAuthenticated = async () => {
  try {
    const { getUserProfile } = await import("./api")
    await getUserProfile()
    return true
  } catch (error) {
    return false
  }
}
