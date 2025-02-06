import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createTask,
  getFolderTasks,
  getPrivateFolders,
  getPublicFolders,
  updateTask,
  deleteTask,
  completePublicTask,
} from "../utils/api"
import Loader from "../components/Loader"
import { Pencil, Trash2 } from "lucide-react"

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState("")
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [publicFolders, setPublicFolders] = useState([])
  const [editingTask, setEditingTask] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchFolders()
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      fetchTasks(selectedFolder)
      checkFolderPublicStatus(selectedFolder)
    } else {
      setTasks([])
    }
  }, [selectedFolder])

  const fetchFolders = async () => {
    try {
      const publicFoldersData = await getPublicFolders()
      const privateFoldersData = await getPrivateFolders()
      setPublicFolders(publicFoldersData.data.map((folder) => folder.id))
      setFolders([...publicFoldersData.data, ...privateFoldersData.data])
    } catch (error) {
      console.error("Error fetching folders:", error)
    }
  }

  const fetchTasks = async (folderId) => {
    setLoadingTasks(true)
    try {
      const response = await getFolderTasks(folderId)
      setTasks(response.data.tasks.length ? response.data.tasks : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
    } finally {
      setLoadingTasks(false)
    }
  }

  const checkFolderPublicStatus = (folderId) => {
    setIsPublic(publicFolders.includes(folderId))
  }

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        folderId: selectedFolder,
        public: isPublic,
        points: isPublic ? (data.points ? Number.parseInt(data.points, 10) : 0) : null,
      }

      const token = localStorage.getItem("token")
      if (editingTask) {
        await updateTask(editingTask.id, taskData, token)
        setEditingTask(null)
      } else {
        await createTask(taskData, token)
      }
      reset()
      fetchTasks(selectedFolder)
    } catch (error) {
      console.error("Error creating/updating task:", error)
    }
  }

  const handleCompleteTask = async (id, folderId) => {
    try {
      const token = localStorage.getItem("token")
      const isTaskPublic = publicFolders.includes(folderId)
      
      if (isTaskPublic) {
        await completePublicTask(id, token)
      } else {
        await updateTask(id, { completed: true }, token)
      }
      
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, completed: true } : task
        )
      )
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setValue("task", task.task)
    setValue("description", task.description)
    setValue("points", task.points)
  }

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await deleteTask(id, token)
      fetchTasks(selectedFolder)
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-notion-bg dark:bg-notion-dark">
        <CardHeader>
          <CardTitle className="text-notion-text dark:text-notion-text-dark">Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedFolder} value={selectedFolder}>
            <SelectTrigger className="w-full bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
              <SelectValue placeholder="Select a folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedFolder && (
            <>
              {loadingTasks ? (
                <div className="mt-6">
                  <Loader size="large" />
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <Card key={task.id} className="bg-notion-bg dark:bg-notion-dark">
                        <CardContent className="pt-6">
                          <h3
                            className={`text-lg font-semibold ${task.completed ? "line-through text-notion-text-light" : "text-notion-text"} dark:text-notion-text-dark`}
                          >
                            {task.task}
                          </h3>
                          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">Points: {task.points}</p>
                          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">
                            Status: {task.completed ? "Completed" : "Pending"}
                          </p>
                          <div className="mt-4 space-x-2">
                            <Button
                              onClick={() => handleCompleteTask(task.id, selectedFolder)}
                              className="bg-notion-orange hover:bg-notion-orange-dark text-white"
                              disabled={task.completed}
                            >
                              {task.completed ? "Task Completed" : "Complete Task"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-notion-text-light dark:text-notion-text-dark">No tasks available</p>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Tasks
