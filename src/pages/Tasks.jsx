"use client"

import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { Pencil, Trash2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { TaskCalendar } from "@/components/TaskCalendar"
import {
  createTask as createTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  getTasks as getTasksAction,
  completeTask as completeTasksAction,
} from "@/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Task {
  id: string
  task: string
  description?: string
  completed: boolean
  date?: Date
  points?: number
}

interface TasksProps {
  selectedFolder: string | null
  isPublic: boolean
  isPrivateFolder: boolean
}

const Tasks: React.FC<TasksProps> = ({ selectedFolder, isPublic, isPrivateFolder }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<{ task: string; description?: string; date?: Date; points?: number }
>(
{
  task: "", description
  : "",
      date: undefined,
      points: undefined,
  ,
}
)
const [tasks, setTasks] = useState<Task[]>([])
const [loadingTasks, setLoadingTasks] = useState(false)
const [editingTask, setEditingTask] = (useState < Task) | (null > null)
const { toast } = useToast()

useEffect(() => {
  if (selectedFolder) {
    fetchTasks(selectedFolder)
  }
}, [selectedFolder])

const fetchTasks = async (folderId: string) => {
    setLoadingTasks(true)
    try {
      const fetchedTasks = await getTasksAction(folderId)
      setTasks(fetchedTasks)
    } catch (error) {
      toast({
        title: "Error fetching tasks",
        description: "Failed to retrieve tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingTasks(false)
    }
  }

const onSubmit = async (data: { task: string; description?: string; date?: Date; points?: number }) => {
    if (!selectedFolder) return

    try {
      if (editingTask) {
        // Update existing task
        await updateTaskAction(editingTask.id, {
          ...data,
          folderId: selectedFolder,
          completed: editingTask.completed,
        })
        toast({
          title: "Task updated successfully!",
        })
      } else {
        // Create new task
        await createTaskAction({ ...data, folderId: selectedFolder, completed: false })
        toast({
          title: "Task created successfully!",
        })
      }
      fetchTasks(selectedFolder) // Refresh tasks
      reset() // Clear form
      setEditingTask(null) // Clear editing state
    } catch (error) {
      toast({
        title: editingTask ? "Error updating task" : "Error creating task",
        description: "Failed to save the task. Please try again.",
        variant: "destructive",
      })
    }
  }

const handleDeleteTask = async (taskId: string) => {
    if (!selectedFolder) return

    try {
      await deleteTaskAction(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId)) // Optimistically update the UI
      toast({
        title: "Task deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive",
      })
    }
  }

const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setValue("task", task.task)
    setValue("description", task.description)
    setValue("date", task.date)
    setValue("points", task.points)
  }

const handleCompleteTask = async (taskId: string, folderId: string) => {
  try {
    await completeTasksAction(taskId)
    fetchTasks(folderId)
    toast({
      title: "Task completed successfully!",
    })
  } catch (error) {
    toast({
      title: "Error completing task",
      description: "Failed to complete the task. Please try again.",
      variant: "destructive",
    })
  }
}

const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("date", new Date(e.target.value))
  }

return (
    <>
      {selectedFolder && (
        <>
          <Tabs defaultValue="create" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create Task</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              {isPrivateFolder && <TabsTrigger value="calendar">Calendar View</TabsTrigger>}
            </TabsList>

            <TabsContent value="create" className="mt-4">
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

