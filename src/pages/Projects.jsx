import { useState, useEffect } from "react"
import { createProject, getPublicProjects, getPrivateProjects, completeProject } from "../utils/api"

function Projects() {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: "", description: "", public: false })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const publicProjects = await getPublicProjects()
      const privateProjects = await getPrivateProjects()
      setProjects([...publicProjects.data, ...privateProjects.data])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      await createProject(newProject)
      setNewProject({ name: "", description: "", public: false })
      fetchProjects()
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleCompleteProject = async (id) => {
    try {
      await completeProject(id)
      fetchProjects()
    } catch (error) {
      console.error("Error completing project:", error)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Projects</h2>
      <form onSubmit={handleCreateProject} className="space-y-4">
        <input
          type="text"
          placeholder="Project Name"
          value={newProject.name}
          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          required
          className="w-full px-3 py-2 border border-notion-gray rounded-md focus:outline-none focus:ring-2 focus:ring-notion-orange"
        />
        <textarea
          placeholder="Description"
          value={newProject.description}
          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          className="w-full px-3 py-2 border border-notion-gray rounded-md focus:outline-none focus:ring-2 focus:ring-notion-orange"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newProject.public}
            onChange={(e) => setNewProject({ ...newProject, public: e.target.checked })}
            className="form-checkbox text-notion-orange"
          />
          <span>Public</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-notion-orange text-white rounded-md hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
        >
          Create Project
        </button>
      </form>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li key={project.id} className={`bg-white p-4 rounded-md shadow ${project.completed ? 'line-through text-gray-500' : ''}`}>
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-notion-text-light">{project.description}</p>
            <p className="text-sm text-notion-text-light">Status: {project.public ? "Public" : "Private"}</p>
            <button
              onClick={() => handleCompleteProject(project.id)}
              className="mt-2 px-3 py-1 bg-notion-gray text-notion-text rounded-md hover:bg-notion-gray-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              Complete Project
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Projects