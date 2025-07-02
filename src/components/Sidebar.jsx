"use client"

import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import ThemeToggle from "./ThemeToggle"
import {
  Menu,
  X,
  Home,
  User,
  Wallet,
  PieChart,
  FolderOpen,
  FileText,
  BarChart2,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  KeyRound,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  Tags,
  FileOutput,
} from "lucide-react"

function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  // Cerrar el sidebar en dispositivos móviles cuando cambia la ruta
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }, [location.pathname, setIsOpen])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = async () => {
    try {
      // Hacer la petición POST al endpoint de refresh
      const response = await fetch("https://api-familia-tareas-node.onrender.com/auth/refresh", {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          // Incluir el token de autorización si es necesario
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        // Agregar body si es necesario
        body: JSON.stringify({}),
      })

      if (response.ok) {
        console.log("Logout request successful")
      } else {
        console.error("Logout request failed:", response.status)
      }
    } catch (error) {
      console.error("Error during logout request:", error)
    } finally {
      // Ejecutar el logout local independientemente del resultado de la petición
      logout()
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Botón de toggle para el sidebar (visible en todas las pantallas) */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-notion-gray dark:bg-notion-dark text-notion-text dark:text-notion-text-dark hover:bg-notion-gray-dark dark:hover:bg-gray-700 focus:outline-none"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay para cerrar el sidebar cuando está abierto */}
      {isOpen && window.innerWidth < 768 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-notion-gray dark:bg-notion-dark w-64 h-screen space-y-6 py-7 px-2 fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out z-40 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Espacio para el botón de toggle */}
        <div className="h-10"></div>

        {/* Título y toggle de tema */}
        <div className="flex items-center justify-between px-4 pt-2 pb-4 border-b border-notion-gray-dark dark:border-gray-700">
          <h1 className="text-xl font-bold text-notion-text dark:text-notion-text-dark">TASK AND EXPENSES</h1>
          <ThemeToggle />
        </div>

        {/* Información del usuario en el sidebar */}
        {user && (
          <div className="px-4 py-2 mb-4 border-b border-notion-gray-dark dark:border-gray-700">
            <p className="text-sm font-medium text-notion-text dark:text-notion-text-dark">Logged in as:</p>
            <p className="text-notion-text-light dark:text-notion-text-dark truncate">{user.name}</p>
            <button
              onClick={handleLogout}
              className="mt-2 flex items-center text-sm text-notion-text-light dark:text-notion-text-dark hover:text-notion-orange dark:hover:text-notion-orange-dark"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        )}

        <nav className="space-y-1">
          <Link
            to="/"
            onClick={() => window.innerWidth < 768 && setIsOpen(false)}
            className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
          >
            <Home className="h-5 w-5 mr-3" />
            Home
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <User className="h-5 w-5 mr-3" />
                Profile
              </Link>

              {/* Finanzas */}
              <div className="mt-4 mb-2 px-4">
                <h3 className="text-sm font-semibold text-notion-text dark:text-notion-text-dark">Finances</h3>
              </div>
              <Link
                to="/accounts"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                Accounts
              </Link>
              <Link
                to="/expenses"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <ArrowDownCircle className="h-5 w-5 mr-3" />
                Expenses
              </Link>
              <Link
                to="/incomes"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <ArrowUpCircle className="h-5 w-5 mr-3" />
                Incomes
              </Link>
              <Link
                to="/categories"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <Tags className="h-5 w-5 mr-3" />
                Categories
              </Link>
              <Link
                to="/finances"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <FileOutput className="h-5 w-5 mr-3" />
                Export Finances
              </Link>

              {/* Tareas */}
              <div className="mt-4 mb-2 px-4">
                <h3 className="text-sm font-semibold text-notion-text dark:text-notion-text-dark">Tasks</h3>
              </div>
              <Link
                to="/projects"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <Wallet className="h-5 w-5 mr-3" />
                Projects
              </Link>
              <Link
                to="/folders"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <FolderOpen className="h-5 w-5 mr-3" />
                Folders
              </Link>
              <Link
                to="/tasks"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <FileText className="h-5 w-5 mr-3" />
                Tasks
              </Link>
              <Link
                to="/tasks/monthly"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                Monthly Graphic
              </Link>

              {/* Users */}
              <div className="mt-4 mb-2 px-4">
                <h3 className="text-sm font-semibold text-notion-text dark:text-notion-text-dark">Users</h3>
              </div>
              <Link
                to="/users/points"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <PieChart className="h-5 w-5 mr-3" />
                User Points
              </Link>
              {user.isAdmin && (
                <Link
                  to="/users"
                  onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                  className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
                >
                  <Users className="h-5 w-5 mr-3" />
                  Users
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <LogIn className="h-5 w-5 mr-3" />
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <UserPlus className="h-5 w-5 mr-3" />
                Register
              </Link>
              <Link
                to="/password-recovery"
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                <KeyRound className="h-5 w-5 mr-3" />
                Forgot Password
              </Link>
            </>
          )}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
