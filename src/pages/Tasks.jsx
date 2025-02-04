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
  completeTask,
  getPrivateFolders,
  getPublicFolders,
  updateTask,
  deleteTask,
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

  const handleCompleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await completeTask(id, token)
      fetchTasks(selectedFolder)
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-notion-text dark:text-notion-text-dark">
                    Task Name
                  </Label>
                  <Input
                    id="name"
                    className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                    {...register("task", { required: "Task name is required" })}
                  />
                  {errors.task && <p className="text-sm text-red-500">{errors.task.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-notion-text dark:text-notion-text-dark">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                    {...register("description")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points" className="text-notion-text dark:text-notion-text-dark">
                    Points
                  </Label>
                  <Input
                    id="points"
                    type="number"
                    className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                    {...register("points", { min: 0 })}
                    disabled={!isPublic}
                  />
                </div>

                <Button type="submit" className="bg-notion-orange hover:bg-notion-orange-dark text-white">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
                {editingTask && (
                  <Button
                    type="button"
                    onClick={() => setEditingTask(null)}
                    className="ml-2 bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
                  >
                    Cancel
                  </Button>
                )}
              </form>

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
                          <h3 className="text-lg font-semibold text-notion-text dark:text-notion-text-dark">
                            {task.task}
                          </h3>
                          {task.description && (
                            <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                              {task.description}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                            Points: {task.points}
                          </p>
                          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">
                            Status: {task.completed ? "Completed" : "Pending"}
                          </p>
                          <div className="mt-4 space-x-2">
                            <Button
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-notion-orange hover:bg-notion-orange-dark text-white"
                              disabled={task.completed}
                            >
                              {task.completed ? "Task Completed" : "Complete Task"}
                            </Button>
                            <Button
                              onClick={() => handleEditTask(task)}
                              className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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

