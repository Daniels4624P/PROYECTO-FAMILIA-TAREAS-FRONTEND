"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import Sidebar from "./components/Sidebar"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Users from "./pages/Users"
import Projects from "./pages/Projects"
import Folders from "./pages/Folders"
import Tasks from "./pages/Tasks"
import Home from "./pages/Home"
import UsersPoints from "./pages/UsersPoints"
import TasksChart from "./pages/TasksChart"
import PasswordRecovery from "./pages/PasswordRecovery"
import ChangePassword from "./pages/ChangePassword"
import Accounts from "./pages/Accounts"
import Expenses from "./pages/Expenses"
import Categories from "./pages/Categories"
import Finances from "./pages/Finances"
import Incomes from "./pages/Incomes"

function App() {
  // Modificar el useState inicial para leer del localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Intentar obtener el estado guardado del localStorage
    const savedState = localStorage.getItem("sidebarState")
    // Si existe un valor guardado, convertirlo a booleano, sino usar el valor por defecto
    return savedState !== null ? savedState === "true" : window.innerWidth >= 768
  })

  // Añadir un efecto para guardar el estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("sidebarState", sidebarOpen)
  }, [sidebarOpen])

  const location = useLocation()

  // Cerrar el sidebar cuando cambia la ruta en dispositivos móviles
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [location.pathname])

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white dark:bg-[#191919] text-black dark:text-white transition-colors duration-200">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div
          className={`flex flex-col flex-1 overflow-hidden transition-all duration-200 ease-in-out ${
            sidebarOpen ? "ml-0 md:ml-64" : "ml-0"
          }`}
        >
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F7F6F3] dark:bg-[#202020] transition-colors duration-200">
            <div className="container mx-auto px-6 py-8 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/folders" element={<Folders />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/users/points" element={<UsersPoints />} />
                <Route path="/tasks/monthly" element={<TasksChart />} />
                <Route path="/password-recovery" element={<PasswordRecovery />} />
                <Route path="/recovery" element={<ChangePassword />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/finances" element={<Finances />} />
                <Route path="/incomes" element={<Incomes />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App

