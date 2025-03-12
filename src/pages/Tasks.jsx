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
import { Pencil, Trash2, ChevronUp, Plus, List, Calendar, X } from "lucide-react"
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
  const [showForm, setShowForm] = useState(true)
  const [inlineEditingTaskId, setInlineEditingTaskId] = useState(null)
  const [numberRepeat, setNumberRepeat] = useState(null)
  const [completingTaskId, setCompletingTaskId] = useState(null)
  const [numberRepeatError, setNumberRepeatError] = useState("")

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
      showAlert("Error al cargar las carpetas")
    }
  }

  const fetchTasks = async (folderId) => {
    setLoadingTasks(true)
    try {
      const response = await getFolderTasks(folderId)
      setTasks(response.data.tasks.length ? response.data.tasks : [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      showAlert("Error al cargar las tareas")
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
    const datetime = e.target.value
    setValue("date", datetime)
  }

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
      // Mostrar la lista de tareas después de crear/actualizar una tarea
      setShowForm(false)
      setInlineEditingTaskId(null)
    } catch (error) {
      console.error("Error creating/updating task:", error)
      showAlert("Error al crear/actualizar la tarea")
    }
  }

  // Función para iniciar el proceso de completar una tarea
  const initiateCompleteTask = (taskId) => {
    // Si la tarea requiere numberRepeat, mostrar el modal
    if ([2, 7, 11, 25].includes(taskId)) {
      setCompletingTaskId(taskId)
      setNumberRepeat(null) // Resetear el valor para nueva entrada
      setNumberRepeatError("") // Limpiar errores previos
    } else {
      // Si no requiere numberRepeat, completar directamente
      handleCompleteTask(taskId, selectedFolder)
    }
  }

  // Función para validar y confirmar la tarea como completada
  const confirmCompleteTask = async () => {
    if (completingTaskId === null) return

    // Validar que numberRepeat tenga un valor
    if (numberRepeat === null || numberRepeat === undefined || numberRepeat === "") {
      setNumberRepeatError("Este campo es obligatorio")
      return
    }

    // Validar el rango según el ID de la tarea
    let maxValue = 5
    let isValid = true

    switch (completingTaskId) {
      case 2:
        maxValue = 2
        if (numberRepeat < 0 || numberRepeat > maxValue) isValid = false
        break
      case 7:
        maxValue = 5
        if (numberRepeat < 0 || numberRepeat > maxValue) isValid = false
        break
      case 11:
        maxValue = 3
        if (numberRepeat < 0 || numberRepeat > maxValue) isValid = false
        break
      case 25:
        maxValue = 5
        if (numberRepeat < 0 || numberRepeat > maxValue) isValid = false
        break
    }

    if (!isValid) {
      setNumberRepeatError(`El valor debe estar entre 0 y ${maxValue}`)
      return
    }

    try {
      const token = localStorage.getItem("token")
      const isTaskPublic = publicFolders.includes(selectedFolder)

      // Crear el objeto con los datos a enviar
      // Siempre incluir numberRepeat en el body para las tareas específicas
      const taskData = {
        numberRepeat: numberRepeat,
      }

      console.log("Enviando datos:", taskData) // Para depuración

      // Llamar a la API correspondiente
      if (isTaskPublic) {
        await completePublicTask(completingTaskId, token, taskData)
      } else {
        await completePrivateTask(completingTaskId, token, taskData)
      }

      // Actualizar el estado local
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === completingTaskId ? { ...task, completed: true } : task)),
      )

      // Limpiar el estado
      setCompletingTaskId(null)
      setNumberRepeat(null)
      setNumberRepeatError("")

      showAlert("Tarea completada con éxito", "success")
    } catch (error) {
      console.error("Error completing task:", error)
      showAlert("Error al completar la tarea")
    }
  }

  // Función para completar tareas que no requieren numberRepeat
  const handleCompleteTask = async (id, folderId) => {
    try {
      const token = localStorage.getItem("token")
      const isTaskPublic = publicFolders.includes(folderId)

      // Para tareas que no requieren numberRepeat, enviar un objeto vacío
      const taskData = {}

      if (isTaskPublic) {
        await completePublicTask(id, token, taskData)
      } else {
        await completePrivateTask(id, token, taskData)
      }

      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, completed: true } : task)))
      showAlert("Tarea completada con éxito", "success")
    } catch (error) {
      console.error("Error completing task:", error)
      showAlert("Error al completar la tarea")
    }
  }

  const handleEditTask = (task) => {
    if (showForm) {
      // Use the main form if it's already visible
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
    } else {
      // Use inline editing
      setInlineEditingTaskId(task.id)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      const token = localStorage.getItem("token")
      await deleteTask(id, token)
      fetchTasks(selectedFolder)
    } catch (error) {
      console.error("Error deleting task:", error)
      showAlert("Error al eliminar la tarea")
    }
  }

  const showAlert = (message, type = "error") => {
    const alertElement = document.createElement("div")
    const bgColor = type === "error" ? "bg-red-100" : "bg-green-100"
    const borderColor = type === "error" ? "border-red-500" : "border-green-500"
    const textColor = type === "error" ? "text-red-700" : "text-green-700"

    alertElement.className = `fixed top-4 right-4 ${bgColor} border-l-4 ${borderColor} ${textColor} p-4 rounded shadow-md z-50`
    alertElement.innerHTML = `
      <div class="flex items-start">
        <div class="ml-3">
          <p class="font-medium">${type === "error" ? "Error" : "Éxito"}</p>
          <ul class="mt-1 list-disc list-inside">
            <li>${message}</li>
          </ul>
        </div>
      </div>
    `
    document.body.appendChild(alertElement)
    setTimeout(() => {
      alertElement.classList.add("opacity-0", "transition-opacity", "duration-500")
      setTimeout(() => document.body.removeChild(alertElement), 500)
    }, 3000)
  }

  // Manejar cambios en el campo numberRepeat del modal
  const handleNumberRepeatChange = (e) => {
    const value = e.target.value
    setNumberRepeat(value === "" ? null : Number(value))

    // Limpiar el error si el usuario está escribiendo
    if (value !== "") {
      setNumberRepeatError("")
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
              <div className="mt-4 flex justify-between items-center">
                <Button onClick={() => setShowForm(!showForm)} variant="outline" className="flex items-center gap-2">
                  {showForm ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Task Form
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </>
                  )}
                </Button>

                {!showForm && isPrivateFolder && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setViewMode("list")}
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <List className="h-4 w-4" />
                      List
                    </Button>
                    <Button
                      onClick={() => setViewMode("calendar")}
                      variant={viewMode === "calendar" ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      Calendar
                    </Button>
                  </div>
                )}
              </div>

              {showForm && (
                <div className="mt-4 border p-4 rounded-md">
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

                    <div className="space-y-2">
                      <Label htmlFor="numberRepeat" className="text-notion-text dark:text-notion-text-dark">
                        Number of Repeats
                      </Label>
                      <Input
                        id="numberRepeat"
                        type="number"
                        className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                        {...register("numberRepeat", { required: "Number of repeats is required", min: 0 })}
                      />
                      {errors.numberRepeat && <p className="text-sm text-red-500">{errors.numberRepeat.message}</p>}
                    </div>

                    <div className="flex justify-between">
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
                          className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Modal para ingresar numberRepeat cuando se completa una tarea */}
              {completingTaskId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-notion-text dark:text-notion-text-dark">
                        Completar Tarea
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setCompletingTaskId(null)
                          setNumberRepeatError("")
                        }}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="numberRepeatComplete" className="text-notion-text dark:text-notion-text-dark">
                          Number of Repeats <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="numberRepeatComplete"
                          type="number"
                          className={`bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark ${
                            numberRepeatError ? "border-red-500 focus:ring-red-500" : ""
                          }`}
                          value={numberRepeat === null ? "" : numberRepeat}
                          onChange={handleNumberRepeatChange}
                          min="0"
                          max={
                            completingTaskId === 2 ? 2 : completingTaskId === 7 ? 5 : completingTaskId === 11 ? 3 : 5
                          }
                          required
                        />
                        {numberRepeatError && <p className="text-sm text-red-500">{numberRepeatError}</p>}
                        <p className="text-xs text-amber-600">
                          {completingTaskId === 2
                            ? "Máximo 2 repeticiones"
                            : completingTaskId === 7
                              ? "Máximo 5 repeticiones"
                              : completingTaskId === 11
                                ? "Máximo 3 repeticiones"
                                : "Máximo 5 repeticiones"}
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setCompletingTaskId(null)
                            setNumberRepeatError("")
                          }}
                          className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={confirmCompleteTask}
                          className="bg-notion-orange hover:bg-notion-orange-dark text-white"
                        >
                          Completar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!showForm && (
                <>
                  {loadingTasks ? (
                    <div className="mt-6">
                      <Loader size="large" />
                    </div>
                  ) : isPrivateFolder && viewMode === "calendar" ? (
                    <div className="mt-4">
                      <TaskCalendar
                        tasks={tasks}
                        onEditTask={handleEditTask}
                        onDeleteTask={handleDeleteTask}
                        onCompleteTask={initiateCompleteTask}
                      />
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {tasks.length > 0 ? (
                        tasks.map((task) => (
                          <Card key={task.id} className="bg-notion-bg dark:bg-notion-dark">
                            <CardContent className="pt-6">
                              {inlineEditingTaskId === task.id ? (
                                // Inline edit form
                                <form
                                  onSubmit={handleSubmit((data) => {
                                    onSubmit(data)
                                    setInlineEditingTaskId(null)
                                  })}
                                  className="space-y-4"
                                >
                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`name-${task.id}`}
                                      className="text-notion-text dark:text-notion-text-dark"
                                    >
                                      Task Name
                                    </Label>
                                    <Input
                                      id={`name-${task.id}`}
                                      className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                      defaultValue={task.task}
                                      {...register("task", { required: "Task name is required" })}
                                    />
                                    {errors.task && <p className="text-sm text-red-500">{errors.task.message}</p>}
                                  </div>

                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`description-${task.id}`}
                                      className="text-notion-text dark:text-notion-text-dark"
                                    >
                                      Description
                                    </Label>
                                    <Textarea
                                      id={`description-${task.id}`}
                                      className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                      defaultValue={task.description}
                                      {...register("description")}
                                    />
                                  </div>

                                  {!isPublic && (
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor={`date-${task.id}`}
                                        className="text-notion-text dark:text-notion-text-dark"
                                      >
                                        Date and Time
                                      </Label>
                                      <Input
                                        id={`date-${task.id}`}
                                        type="datetime-local"
                                        className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                        defaultValue={task.date ? new Date(task.date).toISOString().slice(0, 16) : ""}
                                        onChange={handleDateTimeChange}
                                        {...register("date")}
                                      />
                                    </div>
                                  )}

                                  {isPublic && (
                                    <div className="space-y-2">
                                      <Label
                                        htmlFor={`points-${task.id}`}
                                        className="text-notion-text dark:text-notion-text-dark"
                                      >
                                        Points
                                      </Label>
                                      <Input
                                        id={`points-${task.id}`}
                                        type="number"
                                        className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                        defaultValue={task.points}
                                        {...register("points", { min: 0 })}
                                      />
                                    </div>
                                  )}

                                  <div className="space-y-2">
                                    <Label
                                      htmlFor={`numberRepeat-${task.id}`}
                                      className="text-notion-text dark:text-notion-text-dark"
                                    >
                                      Number of Repeats
                                    </Label>
                                    <Input
                                      id={`numberRepeat-${task.id}`}
                                      type="number"
                                      className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                      defaultValue={task.numberRepeat || ""}
                                      {...register("numberRepeat", { min: 0 })}
                                    />
                                  </div>

                                  <div className="flex justify-between">
                                    <Button
                                      type="submit"
                                      className="bg-notion-orange hover:bg-notion-orange-dark text-white"
                                    >
                                      Update Task
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        setInlineEditingTaskId(null)
                                      }}
                                      className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              ) : (
                                // Normal task view
                                <>
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
                                    Status:{" "}
                                    {task.completed ? (isPublic ? "Completed" : "Completed (Private)") : "Pending"}
                                  </p>
                                  <div className="mt-4 space-x-2">
                                    <Button
                                      onClick={() => initiateCompleteTask(task.id)}
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
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-notion-text-light dark:text-notion-text-dark">
                          No tasks available
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Tasks

