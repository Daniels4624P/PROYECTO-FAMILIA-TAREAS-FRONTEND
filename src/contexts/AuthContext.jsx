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

  return (
    <AuthContext.Provider value={{ user, login: authLogin, register: authRegister, logout: authLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
