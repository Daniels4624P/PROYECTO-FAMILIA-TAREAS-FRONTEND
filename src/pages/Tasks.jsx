"use client"

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
  completePrivateTask,
} from "../utils/api"
import Loader from "../components/Loader"
import { Pencil, Trash2 } from "lucide-react"
import TaskCalendar from "../components/TaskCalendar"

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState("")
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState("list") 
  const [isPrivateFolder, setIsPrivateFolder] = useState(false)
  const [publicFolders, setPublicFolders] = useState([])

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
    const isPublic = publicFolders.includes(folderId)
    setIsPublic(isPublic)
    setIsPrivateFolder(!isPublic)
  }

  const handleDateTimeChange = (e) => {
    const datetime = e.target.value;
    setValue("date", datetime);
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        folderId: selectedFolder,
        public: isPublic,
        points: isPublic ? (data.points ? Number.parseInt(data.points, 10) : 0) : null,
        date: !isPublic && data.date ? new Date(data.date).toISOString() : null,
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
        await completePrivateTask(id, token)
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: true } : task)))
    } catch (error) {
      console.error("Error completing task:", error)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setValue("task", task.task)
    setValue("description", task.description)
    setValue("points", task.points)
    if (task.date) {
      const dateObj = new Date(task.date)
      const formattedDate = dateObj.toISOString().slice(0, 16) // Format: "YYYY-MM-DDTHH:mm"
      setValue("date", formattedDate)
    } else {
      setValue("date", "")
    }
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
              {selectedFolder && isPrivateFolder && (
                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    onClick={() => setViewMode("list")}
                    className={`${
                      viewMode === "list" ? "bg-notion-orange" : "bg-notion-gray"
                    } hover:bg-notion-orange-dark text-white`}
                  >
                    List View
                  </Button>
                  <Button
                    onClick={() => setViewMode("calendar")}
                    className={`${
                      viewMode === "calendar" ? "bg-notion-orange" : "bg-notion-gray"
                    } hover:bg-notion-orange-dark text-white`}
                  >
                    Calendar View
                  </Button>
                </div>
              )}

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

                {!isPublic && (
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-notion-text dark:text-notion-text-dark">
                      Date and Time
                    </Label>
                    <Input
                      id="date"
                      type="datetime-local"
                      className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                      onChange={handleDateTimeChange}
                      {...register("date")}
                    />
                  </div>
                )}

                {isPublic && (
                  <div className="space-y-2">
                    <Label htmlFor="points" className="text-notion-text dark:text-notion-text-dark">
                      Points
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                      {...register("points", { min: 0 })}
                    />
                  </div>
                )}

                <Button type="submit" className="bg-notion-orange hover:bg-notion-orange-dark text-white">
                  {editingTask ? "Update Task" : "Create Task"}
                </Button>
                {editingTask && (
                  <Button
                    type="button"
                    onClick={() => {
                      setEditingTask(null)
                      reset()
                    }}
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
              ) : isPrivateFolder && viewMode === "calendar" ? (
                <TaskCalendar
                  tasks={tasks}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onCompleteTask={handleCompleteTask}
                />
              ) : (
                <div className="mt-6 space-y-4">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <Card key={task.id} className="bg-notion-bg dark:bg-notion-dark">
                        <CardContent className="pt-6">
                          <h3
                            className={`text-lg font-semibold ${
                              task.completed ? "line-through text-notion-text-light" : "text-notion-text"
                            } dark:text-notion-text-dark`}
                          >
                            {task.task}
                          </h3>
                          {task.description && (
                            <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                              {task.description}
                            </p>
                          )}
                          {task.date && (
                            <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                              Date: {new Date(task.date).toLocaleString()}
                            </p>
                          )}
                          {isPublic && (
                            <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                              Points: {task.points}
                            </p>
                          )}
                          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">
                            Status: {task.completed ? (isPublic ? "Completed" : "Completed (Private)") : "Pending"}
                          </p>
                          <div className="mt-4 space-x-2">
                            <Button
                              onClick={() => handleCompleteTask(task.id, selectedFolder)}
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
