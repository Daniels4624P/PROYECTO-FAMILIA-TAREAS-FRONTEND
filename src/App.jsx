import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Folders from "./pages/Folders";
import Tasks from "./pages/Tasks";
import { useTheme } from "./contexts/ThemeContext";

function App() {
  return (
    <div className="flex h-screen bg-notion-bg text-notion-text transition-all">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Routes>
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
  );
}

export default App;
