import { useAuth } from "../contexts/AuthContext"
import ThemeToggle from "./ThemeToggle"

function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-notion-text">Task Manager</h1>
        <div className="flex items-center">
          {user && <span className="mr-4 text-notion-text">Welcome, {user.name}</span>}
          <ThemeToggle />
          {user && (
            <button
              onClick={logout}
              className="ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

