"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  createTask,
  getFolderTasks,
  getPrivateFolders,
  getPublicFolders,
  updateTask,
  deleteTask,
  completePublicTask,
  completePrivateTask,
  checkGoogleCalendarAccess,
  getGoogleCalendarAuthUrl,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "../utils/api"
import Loader from "../components/Loader"
import { Pencil, Trash2, ChevronUp, Plus, X, ExternalLink } from "lucide-react"
import TaskCalendar from "../components/TaskCalendar"

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [dataGoogle, setDataGoogle] = useState([])
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState("")
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editingGoogleEvent, setEditingGoogleEvent] = useState(null)
  const [isPrivateFolder, setIsPrivateFolder] = useState(false)
  const [publicFolders, setPublicFolders] = useState([])
  const [showForm, setShowForm] = useState(true)
  const [inlineEditingTaskId, setInlineEditingTaskId] = useState(null)
  const [numberRepeat, setNumberRepeat] = useState(null)
  const [completingTaskId, setCompletingTaskId] = useState(null)
  const [numberRepeatError, setNumberRepeatError] = useState("")
  const [hasGoogleAccess, setHasGoogleAccess] = useState(false)
  const [showGoogleAuthAlert, setShowGoogleAuthAlert] = useState(false)
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false)

  // New states for Google Calendar integration
  const [calendarType, setCalendarType] = useState("local") // "local" or "google"
  const [enableReminders, setEnableReminders] = useState(false)
  const [reminderTypes, setReminderTypes] = useState([]) // ["popup", "email"]
  const [reminderMinutesPopup, setReminderMinutesPopup] = useState(15)
  const [reminderMinutesEmail, setReminderMinutesEmail] = useState(15)

  // New states for time units
  const [reminderUnitPopup, setReminderUnitPopup] = useState("minutes") // "minutes" or "days"
  const [reminderUnitEmail, setReminderUnitEmail] = useState("minutes") // "minutes" or "days"

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  // Watch dateStart to validate dateEnd
  const watchDateStart = watch("dateStart")

  // Function to determine if dateEnd is required
  const isDateEndRequired = () => {
    return (
      editingGoogleEvent || 
      calendarType === "google" || 
      (editingTask && editingTask.googleEventId)
    )
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      fetchTasks(selectedFolder)
      checkFolderPublicStatus(selectedFolder)
    } else {
      setTasks([])
      setDataGoogle([])
    }
  }, [selectedFolder])

  // Reset Google Calendar options when switching folders
  useEffect(() => {
    if (!isPrivateFolder) {
      setCalendarType("local")
      setEnableReminders(false)
      setReminderTypes([])
    }
  }, [isPrivateFolder])

  // Check Google Calendar access when component mounts and when private folder is selected
  useEffect(() => {
    if (isPrivateFolder) {
      checkGoogleAccess()
    }
  }, [isPrivateFolder])

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
      console.log("📋 API Response:", response.data)
      
      // FIXED: Handle the new API response format
      if (response.data && response.data.folder && response.data.folder.tasks) {
        // New format: { folder: { tasks: [...] } }
        setTasks(response.data.folder.tasks)
        setDataGoogle(response.data.dataGoogle || [])
        console.log("✅ Tasks loaded from folder.tasks:", response.data.folder.tasks.length)
      } else if (response.data && response.data.tasks) {
        // Fallback format: { tasks: [...] }
        setTasks(response.data.tasks)
        setDataGoogle(response.data.dataGoogle || [])
        console.log("✅ Tasks loaded from tasks:", response.data.tasks.length)
      } else if (response.data && response.data.message && response.data.message.includes('Verifica el correo para crear tareas privadas con google')) {
        console.log('🔍 Backend says Google Calendar auth needed')
        await checkGoogleAccess()
        setTasks([])
        setDataGoogle([])
      } else {
        // Direct array or empty
        setTasks(Array.isArray(response.data) ? response.data : [])
        setDataGoogle([])
        console.log("✅ Tasks loaded directly:", Array.isArray(response.data) ? response.data.length : 0)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
      showAlert("Error al cargar las tareas")
      setTasks([])
      setDataGoogle([])
    } finally {
      setLoadingTasks(false)
    }
  }

  const checkFolderPublicStatus = (folderId) => {
    const isPublic = publicFolders.includes(folderId)
    setIsPublic(isPublic)
    setIsPrivateFolder(!isPublic)
  }

  // Function to check Google Calendar access from backend
  const checkGoogleAccess = async () => {
    try {
      const response = await checkGoogleCalendarAccess()
      console.log('🔍 Google Calendar access check response:', response.data)
      const hasAccess = response.data?.hasAccess === true
      setHasGoogleAccess(hasAccess)
      
      // Show alert only if user doesn't have access and is in a private folder
      if (!hasAccess && isPrivateFolder) {
        setShowGoogleAuthAlert(true)
      } else {
        setShowGoogleAuthAlert(false)
      }
    } catch (error) {
      console.error("Error checking Google Calendar access:", error)
      // If the endpoint doesn't exist, assume no access
      setHasGoogleAccess(false)
      if (isPrivateFolder) {
        setShowGoogleAuthAlert(true)
      }
    }
  }

  const handleGoogleCalendarAuth = async () => {
    setGoogleAuthLoading(true)
    try {
      const response = await getGoogleCalendarAuthUrl()
      if (response.data) {
        // The response.data contains the Google authorization URL
        window.location.href = response.data
      }
    } catch (error) {
      console.error("Error getting Google Calendar auth URL:", error)
      showAlert("Failed to initiate Google Calendar authorization. Please try again.")
    } finally {
      setGoogleAuthLoading(false)
    }
  }

  const handleDateTimeChange = (e) => {
    const datetime = e.target.value
    setValue("dateStart", datetime)
  }

  const handleReminderTypeChange = (type, checked) => {
    if (checked) {
      setReminderTypes((prev) => [...prev, type])
    } else {
      setReminderTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  }

  // Function to convert time to minutes
  const convertToMinutes = (value, unit) => {
    if (unit === "days") {
      return value * 24 * 60 // Convert days to minutes
    }
    return value // Already in minutes
  }

  // Function to convert minutes back to appropriate unit and value
  const convertFromMinutes = (minutes) => {
    if (minutes >= 1440 && minutes % 1440 === 0) {
      // If it's a whole number of days
      return {
        value: minutes / 1440,
        unit: "days",
      }
    }
    return {
      value: minutes,
      unit: "minutes",
    }
  }

  // Handle editing Google Calendar events
  const handleEditGoogleEvent = (task) => {
    setEditingGoogleEvent(task)
    setShowForm(true)
    setValue("task", task.task || task.title)
    setValue("description", task.description || "")
    
    if (task.dateStart) {
      const dateObj = new Date(task.dateStart)
      const formattedDate = dateObj.toISOString().slice(0, 16)
      setValue("dateStart", formattedDate)
    }
    
    if (task.dateEnd) {
      const dateEndObj = new Date(task.dateEnd)
      const formattedDateEnd = dateEndObj.toISOString().slice(0, 16)
      setValue("dateEnd", formattedDateEnd)
    }

    // Set reminder settings if available
    if (task.reminderMinutesPopup || task.reminderMinutesEmail) {
      setEnableReminders(true)
      const reminderTypesArray = []

      if (task.reminderMinutesPopup) {
        reminderTypesArray.push("popup")
        const popupConversion = convertFromMinutes(task.reminderMinutesPopup)
        setReminderMinutesPopup(popupConversion.value)
        setReminderUnitPopup(popupConversion.unit)
      }

      if (task.reminderMinutesEmail) {
        reminderTypesArray.push("email")
        const emailConversion = convertFromMinutes(task.reminderMinutesEmail)
        setReminderMinutesEmail(emailConversion.value)
        setReminderUnitEmail(emailConversion.unit)
      }

      setReminderTypes(reminderTypesArray)
    } else {
      setEnableReminders(false)
      setReminderTypes([])
    }

    // Scroll to form
    setTimeout(() => {
      document.querySelector(".border.p-4.rounded-md")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // Handle deleting Google Calendar events
  const handleDeleteGoogleEvent = async (eventId) => {
    try {
      await deleteGoogleEvent(eventId)
      // Refresh the tasks to get updated data
      fetchTasks(selectedFolder)
      showAlert("Google Calendar event deleted successfully", "success")
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error)
      showAlert("Error al eliminar el evento de Google Calendar: " + (error.message || "Unknown error"))
    }
  }

  const onSubmit = async (data) => {
    try {
      // Check if we're editing a Google Calendar event
      if (editingGoogleEvent) {
        const changes = {
          summary: data.task,
          description: data.description,
          startDate: data.dateStart ? new Date(data.dateStart).toISOString() : undefined,
          endDate: data.dateEnd ? new Date(data.dateEnd).toISOString() : undefined,
        }

        // Add reminder settings if enabled
        if (enableReminders && reminderTypes.length > 0) {
          if (reminderTypes.includes("popup")) {
            changes.popupTime = convertToMinutes(reminderMinutesPopup, reminderUnitPopup)
          }
          if (reminderTypes.includes("email")) {
            changes.emailTime = convertToMinutes(reminderMinutesEmail, reminderUnitEmail)
          }
        }

        await updateGoogleEvent(editingGoogleEvent.googleEventId, changes)
        setEditingGoogleEvent(null)
        showAlert("Google Calendar event updated successfully", "success")
      } else {
        // Regular task creation/editing logic
        const taskData = {
          ...data,
          folderId: selectedFolder,
          public: isPublic,
          points: isPublic ? (data.points ? Number.parseInt(data.points, 10) : 0) : null,
          // Para tareas privadas: usar dateStart, para públicas: no enviar fecha
          dateStart: !isPublic && data.dateStart ? new Date(data.dateStart).toISOString() : null,
          // dateEnd siempre será null al crear/editar (solo se establece al completar)
          dateEnd: null,
        }

        // Add Google Calendar specific fields for private folders
        if (isPrivateFolder && calendarType === "google") {
          // Validate dateEnd is provided for Google Calendar
          if (!data.dateEnd) {
            showAlert("End date is required for Google Calendar integration")
            return
          }

          taskData.dateEnd = new Date(data.dateEnd).toISOString()
          taskData.timeZone = getUserTimezone()
          taskData.local = false

          // Add reminder settings with conversion to minutes
          if (enableReminders && reminderTypes.length > 0) {
            if (reminderTypes.includes("popup")) {
              taskData.reminderMinutesPopup = convertToMinutes(reminderMinutesPopup, reminderUnitPopup)
            }
            if (reminderTypes.includes("email")) {
              taskData.reminderMinutesEmail = convertToMinutes(reminderMinutesEmail, reminderUnitEmail)
            }
          }
        } else if (isPrivateFolder) {
          taskData.local = true
        }

        // Add Google Calendar specific fields when editing Google events
        if (editingTask && editingTask.googleEventId) {
          // Always include these fields for Google Calendar events during edit
          if (data.dateEnd) {
            taskData.dateEnd = new Date(data.dateEnd).toISOString()
          }

          taskData.timeZone = getUserTimezone()
          taskData.local = false

          // Add reminder settings if enabled with conversion to minutes
          if (enableReminders && reminderTypes.length > 0) {
            if (reminderTypes.includes("popup")) {
              taskData.reminderMinutesPopup = convertToMinutes(reminderMinutesPopup, reminderUnitPopup)
            } else {
              taskData.reminderMinutesPopup = null
            }

            if (reminderTypes.includes("email")) {
              taskData.reminderMinutesEmail = convertToMinutes(reminderMinutesEmail, reminderUnitEmail)
            } else {
              taskData.reminderMinutesEmail = null
            }
          } else {
            // Clear reminders if disabled
            taskData.reminderMinutesPopup = null
            taskData.reminderMinutesEmail = null
          }
        }

        if (editingTask) {
          await updateTask(editingTask.id, taskData)
          setEditingTask(null)
          showAlert("Tarea actualizada con éxito", "success")
        } else {
          await createTask(taskData)
          showAlert("Tarea creada con éxito", "success")
        }
      }

      reset()
      // Reset Google Calendar states
      setCalendarType("local")
      setEnableReminders(false)
      setReminderTypes([])
      setReminderMinutesPopup(15)
      setReminderMinutesEmail(15)
      setReminderUnitPopup("minutes")
      setReminderUnitEmail("minutes")

      fetchTasks(selectedFolder)
      setShowForm(false)
      setInlineEditingTaskId(null)
    } catch (error) {
      console.error("Error creating/updating task:", error)
      showAlert("Error al crear/actualizar la tarea: " + (error.response?.data?.message || error.message))
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
        // Para tareas privadas, incluir dateEnd con la fecha actual
        ...(!isTaskPublic && { dateEnd: new Date().toISOString() }),
      }

      // Llamar a la API correspondiente
      if (isTaskPublic) {
        await completePublicTask(completingTaskId, token, taskData)
      } else {
        await completePrivateTask(completingTaskId, token, taskData)
      }

      // Actualizar el estado local
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === completingTaskId
            ? {
                ...task,
                completed: true,
                // Si es tarea privada, agregar dateEnd
                ...(!isTaskPublic && { dateEnd: new Date().toISOString() }),
              }
            : task,
        ),
      )

      // Limpiar el estado
      setCompletingTaskId(null)
      setNumberRepeat(null)
      setNumberRepeatError("")

      showAlert("Tarea completada con éxito", "success")
    } catch (error) {
      console.error("Error completing task:", error)
      showAlert("Error al completar la tarea: " + (error.response?.data?.message || error.message))
    }
  }

  // Función para completar tareas que no requieren numberRepeat
  const handleCompleteTask = async (id, folderId) => {
    try {
      const token = localStorage.getItem("token")
      const isTaskPublic = publicFolders.includes(folderId)

      // Para tareas que no requieren numberRepeat
      const taskData = {
        // Para tareas privadas, incluir dateEnd con la fecha actual
        ...(!isTaskPublic && { dateEnd: new Date().toISOString() }),
      }

      if (isTaskPublic) {
        await completePublicTask(id, token, taskData)
      } else {
        await completePrivateTask(id, token, taskData)
      }

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: true,
                // Si es tarea privada, agregar dateEnd
                ...(!isTaskPublic && { dateEnd: new Date().toISOString() }),
              }
            : task,
        ),
      )
      showAlert("Tarea completada con éxito", "success")
    } catch (error) {
      console.error("Error completing task:", error)
      showAlert("Error al completar la tarea: " + (error.response?.data?.message || error.message))
    }
  }

  const handleEditTask = (task) => {
    // Siempre mostrar el formulario principal para editar
    setShowForm(true)
    setEditingTask(task)
    setEditingGoogleEvent(null) // Clear Google event editing state
    setValue("task", task.task)
    setValue("description", task.description)
    setValue("points", task.points)
    if (task.dateStart) {
      const dateObj = new Date(task.dateStart)
      const formattedDate = dateObj.toISOString().slice(0, 16) // Format: "YYYY-MM-DDTHH:mm"
      setValue("dateStart", formattedDate)
    } else {
      setValue("dateStart", "")
    }

    // Check if it's a Google Calendar event and set additional fields
    if (task.googleEventId) {
      setCalendarType("google")

      // Set dateEnd if available
      if (task.dateEnd) {
        const dateEndObj = new Date(task.dateEnd)
        const formattedDateEnd = dateEndObj.toISOString().slice(0, 16)
        setValue("dateEnd", formattedDateEnd)
      }

      // Set reminder settings if available
      if (task.reminderMinutesPopup || task.reminderMinutesEmail) {
        setEnableReminders(true)
        const reminderTypesArray = []

        if (task.reminderMinutesPopup) {
          reminderTypesArray.push("popup")
          const popupConversion = convertFromMinutes(task.reminderMinutesPopup)
          setReminderMinutesPopup(popupConversion.value)
          setReminderUnitPopup(popupConversion.unit)
        }

        if (task.reminderMinutesEmail) {
          reminderTypesArray.push("email")
          const emailConversion = convertFromMinutes(task.reminderMinutesEmail)
          setReminderMinutesEmail(emailConversion.value)
          setReminderUnitEmail(emailConversion.unit)
        }

        setReminderTypes(reminderTypesArray)
      }
    } else {
      setCalendarType("local")
      setEnableReminders(false)
      setReminderTypes([])
      setReminderUnitPopup("minutes")
      setReminderUnitEmail("minutes")
    }

    // Desplazarse al formulario
    setTimeout(() => {
      document.querySelector(".border.p-4.rounded-md")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id)
      fetchTasks(selectedFolder)
      showAlert("Tarea eliminada con éxito", "success")
    } catch (error) {
      console.error("Error deleting task:", error)
      showAlert("Error al eliminar la tarea: " + (error.response?.data?.message || error.message))
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

          {/* Google Calendar Authorization Alert - Only show for private folders without access */}
          {showGoogleAuthAlert && isPrivateFolder && !hasGoogleAccess && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-blue-600 dark:text-blue-400">📅</div>
                  <div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Google Calendar Authorization Required</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      To create private tasks with Google Calendar integration, you need to authorize access to your Google Calendar.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGoogleCalendarAuth}
                    disabled={googleAuthLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    size="sm"
                  >
                    {googleAuthLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Authorize
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowGoogleAuthAlert(false)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                      {editingTask || editingGoogleEvent ? "Edit Task" : "Create New Task"}
                    </>
                  )}
                </Button>

                {/* Mostrar información del tipo de vista según el tipo de carpeta */}
                {!showForm && (
                  <div className="text-sm text-notion-text-light dark:text-notion-text-dark">
                    {isPrivateFolder ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Vista: Calendario (Privada)</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Vista: Lista (Pública)</span>
                    )}
                  </div>
                )}
              </div>

              {showForm && (
                <div className="mt-4 border p-4 rounded-md">
                  {editingGoogleEvent && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                      <h3 className="font-semibold text-red-900 dark:text-red-100 flex items-center gap-2">
                        📅 Editing Google Calendar Event
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Event ID: {editingGoogleEvent.googleEventId}
                      </p>
                    </div>
                  )}

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

                    {(!isPublic || editingGoogleEvent) && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="dateStart" className="text-notion-text dark:text-notion-text-dark">
                            Start Date and Time
                          </Label>
                          <Input
                            id="dateStart"
                            type="datetime-local"
                            className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                            onChange={handleDateTimeChange}
                            {...register("dateStart", {
                              required: editingGoogleEvent ? "Start date is required for Google Calendar events" : false
                            })}
                          />
                          {errors.dateStart && <p className="text-sm text-red-500">{errors.dateStart.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateEnd" className="text-notion-text dark:text-notion-text-dark">
                            End Date and Time {isDateEndRequired() && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id="dateEnd"
                            type="datetime-local"
                            className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                            {...register("dateEnd", {
                              required: isDateEndRequired() ? "End date is required for Google Calendar integration" : false,
                              validate: (value) => {
                                if (isDateEndRequired() && watchDateStart && value) {
                                  return (
                                    new Date(value) > new Date(watchDateStart) ||
                                    "End date must be after start date"
                                  )
                                }
                                return true
                              },
                            })}
                          />
                          {errors.dateEnd && <p className="text-sm text-red-500">{errors.dateEnd.message}</p>}
                        </div>

                        {/* Calendar Type Selection for Private Folders (not shown when editing Google events) */}
                        {!editingGoogleEvent && isPrivateFolder && (
                          <div className="space-y-4 p-4 border rounded-md bg-blue-50 dark:bg-blue-900/20">
                            <Label className="text-notion-text dark:text-notion-text-dark font-semibold">
                              Calendar Integration
                            </Label>
                            <RadioGroup value={calendarType} onValueChange={setCalendarType}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="local" id="local" />
                                <Label htmlFor="local" className="text-notion-text dark:text-notion-text-dark">
                                  Local Calendar Only
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="google" id="google" />
                                <Label htmlFor="google" className="text-notion-text dark:text-notion-text-dark">
                                  Sync with Google Calendar
                                </Label>
                              </div>
                            </RadioGroup>

                            {calendarType === "google" && (
                              <div className="text-sm text-blue-600 dark:text-blue-400">
                                <p>📅 This task will be synced with your Google Calendar</p>
                                <p>🌍 Timezone: {getUserTimezone()}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reminder Settings for Google events */}
                        {(editingGoogleEvent || calendarType === "google" || (editingTask && editingTask.googleEventId)) && (
                          <div className="space-y-3 p-4 border rounded-md bg-yellow-50 dark:bg-yellow-900/20">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="enableReminders"
                                checked={enableReminders}
                                onCheckedChange={setEnableReminders}
                              />
                              <Label
                                htmlFor="enableReminders"
                                className="text-notion-text dark:text-notion-text-dark"
                              >
                                Enable Reminders
                              </Label>
                            </div>

                            {enableReminders && (
                              <div className="space-y-3 ml-6">
                                <Label className="text-notion-text dark:text-notion-text-dark font-medium">
                                  Reminder Types:
                                </Label>

                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="reminderPopup"
                                      checked={reminderTypes.includes("popup")}
                                      onCheckedChange={(checked) => handleReminderTypeChange("popup", checked)}
                                    />
                                    <Label
                                      htmlFor="reminderPopup"
                                      className="text-notion-text dark:text-notion-text-dark"
                                    >
                                      Popup Notification
                                    </Label>
                                  </div>

                                  {reminderTypes.includes("popup") && (
                                    <div className="ml-6 space-y-2">
                                      <Label
                                        htmlFor="reminderMinutesPopup"
                                        className="text-notion-text dark:text-notion-text-dark text-sm"
                                      >
                                        Time before (Popup)
                                      </Label>
                                      <div className="flex space-x-2">
                                        <Input
                                          id="reminderMinutesPopup"
                                          type="number"
                                          min="1"
                                          max={reminderUnitPopup === "days" ? "30" : "43200"}
                                          value={reminderMinutesPopup}
                                          onChange={(e) => setReminderMinutesPopup(Number(e.target.value))}
                                          className="w-20 bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                        />
                                        <Select value={reminderUnitPopup} onValueChange={setReminderUnitPopup}>
                                          <SelectTrigger className="w-24 bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="minutes">Min</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {reminderUnitPopup === "days"
                                          ? `= ${convertToMinutes(reminderMinutesPopup, reminderUnitPopup)} minutes`
                                          : "Max: 30 days (43200 minutes)"}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id="reminderEmail"
                                      checked={reminderTypes.includes("email")}
                                      onCheckedChange={(checked) => handleReminderTypeChange("email", checked)}
                                    />
                                    <Label
                                      htmlFor="reminderEmail"
                                      className="text-notion-text dark:text-notion-text-dark"
                                    >
                                      Email Notification
                                    </Label>
                                  </div>

                                  {reminderTypes.includes("email") && (
                                    <div className="ml-6 space-y-2">
                                      <Label
                                        htmlFor="reminderMinutesEmail"
                                        className="text-notion-text dark:text-notion-text-dark text-sm"
                                      >
                                        Time before (Email)
                                      </Label>
                                      <div className="flex space-x-2">
                                        <Input
                                          id="reminderMinutesEmail"
                                          type="number"
                                          min="1"
                                          max={reminderUnitEmail === "days" ? "30" : "43200"}
                                          value={reminderMinutesEmail}
                                          onChange={(e) => setReminderMinutesEmail(Number(e.target.value))}
                                          className="w-20 bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                        />
                                        <Select value={reminderUnitEmail} onValueChange={setReminderUnitEmail}>
                                          <SelectTrigger className="w-24 bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="minutes">Min</SelectItem>
                                            <SelectItem value="days">Days</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {reminderUnitEmail === "days"
                                          ? `= ${convertToMinutes(reminderMinutesEmail, reminderUnitEmail)} minutes`
                                          : "Max: 30 days (43200 minutes)"}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {isPublic && !editingGoogleEvent && (
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

                    <div className="flex justify-between">
                      <Button type="submit" className="bg-notion-orange hover:bg-notion-orange-dark text-white">
                        {editingTask || editingGoogleEvent ? "Update Task" : "Create Task"}
                      </Button>
                      {(editingTask || editingGoogleEvent) && (
                        <Button
                          type="button"
                          onClick={() => {
                            setEditingTask(null)
                            setEditingGoogleEvent(null)
                            reset()
                            setCalendarType("local")
                            setEnableReminders(false)
                            setReminderTypes([])
                            setReminderMinutesPopup(15)
                            setReminderMinutesEmail(15)
                            setReminderUnitPopup("minutes")
                            setReminderUnitEmail("minutes")
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
                  ) : isPrivateFolder ? (
                    <>
                      {/* Para carpetas privadas: solo mostrar calendario */}
                      <div className="mt-4">
                        <TaskCalendar
                          tasks={tasks}
                          dataGoogle={dataGoogle}
                          onEditTask={handleEditTask}
                          onDeleteTask={handleDeleteTask}
                          onCompleteTask={initiateCompleteTask}
                          onEditGoogleEvent={handleEditGoogleEvent}
                          onDeleteGoogleEvent={handleDeleteGoogleEvent}
                        />
                      </div>
                    </>
                  ) : (
                    // Para carpetas públicas: solo mostrar lista
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
                                        htmlFor={`dateStart-${task.id}`}
                                        className="text-notion-text dark:text-notion-text-dark"
                                      >
                                        Start Date and Time
                                      </Label>
                                      <Input
                                        id={`dateStart-${task.id}`}
                                        type="datetime-local"
                                        className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
                                        defaultValue={
                                          task.dateStart ? new Date(task.dateStart).toISOString().slice(0, 16) : ""
                                        }
                                        onChange={handleDateTimeChange}
                                        {...register("dateStart")}
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
                                  {task.dateStart && (
                                    <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                                      Start Date: {new Date(task.dateStart).toLocaleString()}
                                    </p>
                                  )}
                                  {task.dateEnd && (
                                    <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                                      Completed Date: {new Date(task.dateEnd).toLocaleString()}
                                    </p>
                                  )}
                                  {isPublic && (
                                    <p className="mt-2 text-sm text-notion-text-light dark:text-notion-text-dark">
                                      Points: {task.points}
                                    </p>
                                  )}
                                  <p className="text-sm text-notion-text-light dark:text-notion-text-dark">
                                    Status: {task.completed ? "Completed" : "Pending"}
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