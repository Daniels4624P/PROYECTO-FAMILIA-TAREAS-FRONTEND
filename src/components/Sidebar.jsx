import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function Sidebar() {
  const { user } = useAuth()

  return (
    <div className="bg-notion-gray dark:bg-notion-dark w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav>
        <Link
          to="/"
          className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
        >
          Home
        </Link>
        {user ? (
          <>
            <Link
              to="/profile"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Profile
            </Link>
            <Link
              to="/projects"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Projects
            </Link>
            <Link
              to="/folders"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Folders
            </Link>
            <Link
              to="/tasks"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Tasks
            </Link>
            <Link
              to="/users/points"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              User Points
            </Link>
            {user.isAdmin && (
              <Link
                to="/users"
                className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
              >
                Users
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-notion-gray-dark dark:hover:bg-notion-gray text-notion-text dark:text-notion-text-dark"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}

export default Sidebar

