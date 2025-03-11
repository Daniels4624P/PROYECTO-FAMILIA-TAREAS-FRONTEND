"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/ui/loader"
import { TaskCalendar } from "@/components/task-calendar"
import {
  createTask,
  getTasks,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
  completeTask as completeTaskAPI,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Tasks = ({ selectedFolder, isPublic, isPrivateFolder }) => {
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState("list")
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (selectedFolder) {
      fetchTasks(selectedFolder)
    }
  }, [selectedFolder])

  const fetchTasks = async (folderId) => {
    setLoadingTasks(true)
    try {
      const fetchedTasks = await getTasks(folderId)
      setTasks(fetchedTasks)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: "Failed to retrieve tasks. Please try again.",
      })
      console.error("Error fetching tasks:", error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTaskAPI(selectedFolder, editingTask.id, data)
        toast({
          title: "Task updated successfully!",
        })
      } else {
        await createTask(selectedFolder, data)
        toast({
          title: "Task created successfully!",
        })
      }
      fetchTasks(selectedFolder)
      reset()
      setEditingTask(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error!",
        description: "Failed to create/update the task. Please try again.",
      })
      console.error("Error creating/updating task:", error)
    }
  }

  const handleDateTimeChange = (e) => {
    setValue("date", e.target.value)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setValue("task", task.task)
    setValue("description", task.description)
    setValue("date", task.date)
    setValue("points", task.points)
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTaskAPI(selectedFolder, taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
      toast({
        title: "Task deleted successfully!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error deleting task!",
        description: "Failed to delete the task. Please try again.",
      })
      console.error("Error deleting task:", error)
    }
  }

  const handleCompleteTask = async (taskId, folderId) => {
    try {
      await completeTaskAPI(folderId, taskId)
      fetchTasks(folderId)
      toast({
        title: "Task completed successfully!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error completing task!",
        description: "Failed to complete the task. Please try again.",
      })
      console.error("Error completing task:", error)
    }
  }

  return (
    <>
      {selectedFolder && (
        <Tabs defaultValue="form" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Create Task</TabsTrigger>
            <TabsTrigger value="view">View Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          </TabsContent>

          <TabsContent value="view" className="mt-4">
            {selectedFolder && isPrivateFolder && (
              <div className="mb-4 flex justify-end space-x-2">
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
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}

export default Tasks

