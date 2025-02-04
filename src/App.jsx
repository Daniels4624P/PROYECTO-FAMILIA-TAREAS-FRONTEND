import { Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./contexts/ThemeContext"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import Users from "./pages/Users"
import Projects from "./pages/Projects"
import Folders from "./pages/Folders"
import Tasks from "./pages/Tasks"
import Home from "./pages/Home"

function App() {
  return (
    <ThemeProvider>
      <div className="flex h-screen bg-white dark:bg-[#191919] text-black dark:text-white transition-colors duration-200">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F7F6F3] dark:bg-[#202020] transition-colors duration-200">
            <div className="container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/users" element={<Users />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/folders" element={<Folders />} />
                <Route path="/tasks" element={<Tasks />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App

