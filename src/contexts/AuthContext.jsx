import { createContext, useState, useContext, useEffect } from "react";
import { login, register, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Hook para redirección

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Aquí deberías verificar el token con el backend
      setUser({ token });
    }
  }, []);

  const authLogin = async (email, password) => {
    const userData = await login(email, password);
    setUser(userData);
  };

  const authRegister = async (name, email, password) => {
    const userData = await register(name, email, password);
    setUser(userData);
  };

  const authLogout = () => {
    logout();
    setUser(null);
    navigate("/login"); // Redirigir al login después del logout
  };

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

  return (
    <AuthContext.Provider value={{ user, login: authLogin, register: authRegister, logout: authLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
