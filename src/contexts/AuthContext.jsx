import { createContext, useState, useContext, useEffect } from "react";
import { login, register, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Aquí podrías validar el token llamando al backend
      setUser({ token });
    }
  }, []);

  const authLogin = async (email, password) => {
    try {
      const userData = await login(email, password);
      localStorage.setItem("token", userData.token);
      setUser(userData.user);
      return userData.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const authRegister = async (name, email, password) => {
    try {
      const userData = await register(name, email, password);
      localStorage.setItem("token", userData.token);
      setUser(userData.user);
      return userData.user;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const authLogout = () => {
    logout();
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const registerAndLogin = async (name, email, password) => {
    try {
      const registeredUser = await authRegister(name, email, password);
      await authLogin(email, password);
      navigate("/profile");
    } catch (error) {
      console.error("Error in registerAndLogin:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login: authLogin,
        register: authRegister,
        logout: authLogout,
        registerAndLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
