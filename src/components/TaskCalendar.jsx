"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, CalendarIcon, Bell, Mail } from "lucide-react"

const localizer = momentLocalizer(moment)

const TaskCalendar = ({ tasks, dataGoogle, onEditTask, onDeleteTask, onCompleteTask, onEditGoogleEvent, onDeleteGoogleEvent }) => {
  const [view, setView] = useState(Views.MONTH)
  const [selectedTask, setSelectedTask] = useState(null)

  // Function to convert Google Calendar event to task format
  const convertGoogleEventToTask = (googleEvent) => {
    return {
      id: `google-${googleEvent.id}`,
      task: googleEvent.summary || "Sin título",
      title: googleEvent.summary || "Sin título",
      description: googleEvent.description || "",
      dateStart: googleEvent.start?.dateTime || googleEvent.start?.date,
      dateEnd: googleEvent.end?.dateTime || googleEvent.end?.date,
      timeZone: googleEvent.start?.timeZone || googleEvent.end?.timeZone,
      completed: googleEvent.status === "cancelled" ? true : false,
      local: false,
      googleEventId: googleEvent.id,
      htmlLink: googleEvent.htmlLink,
      // Extract reminder information if available
      reminderMinutesPopup: googleEvent.reminders?.overrides?.find(r => r.method === 'popup')?.minutes,
      reminderMinutesEmail: googleEvent.reminders?.overrides?.find(r => r.method === 'email')?.minutes,
      // Additional Google Calendar fields
      creator: googleEvent.creator,
      organizer: googleEvent.organizer,
      etag: googleEvent.etag,
      kind: googleEvent.kind
    }
  }

  // Function to check if a local task matches a Google event
  const isTaskMatchingGoogleEvent = (localTask, googleEvent) => {
    // Check if local task has the same googleEventId
    if (localTask.googleEventId === googleEvent.id) {
      return true
    }

    // Check if task names are similar and dates are close
    const taskTitle = localTask.task?.toLowerCase().trim()
    const googleTitle = googleEvent.summary?.toLowerCase().trim()
    
    if (taskTitle && googleTitle && taskTitle === googleTitle) {
      // Check if dates are the same day
      const taskDate = localTask.dateStart ? new Date(localTask.dateStart).toDateString() : null
      const googleDate = googleEvent.start?.dateTime || googleEvent.start?.date
      const googleDateStr = googleDate ? new Date(googleDate).toDateString() : null
      
      if (taskDate && googleDateStr && taskDate === googleDateStr) {
        return true
      }
    }

    return false
  }

  // Combine local tasks and Google Calendar events
  const combineTasksAndGoogleEvents = () => {
    let combinedEvents = []
    
    // FIXED: Include ALL local tasks, not just those with dateStart
    const allLocalTasks = tasks || []
    console.log("📋 All local tasks:", allLocalTasks.length)
    
    // Filter tasks with dates for calendar display
    const localTasksWithDates = allLocalTasks.filter(task => 
      task.dateStart && task.dateStart !== null && task.dateStart !== undefined
    )
    console.log("📅 Local tasks with dates:", localTasksWithDates.length)

    // Convert Google events to task format
    const googleTaskEvents = (dataGoogle || []).map(convertGoogleEventToTask)
    console.log("🔴 Google events:", googleTaskEvents.length)

    // Add local tasks with dates first
    localTasksWithDates.forEach(localTask => {
      // Check if this local task matches any Google event
      const matchingGoogleEvent = googleTaskEvents.find(googleTask => 
        isTaskMatchingGoogleEvent(localTask, { 
          id: googleTask.googleEventId, 
          summary: googleTask.task,
          start: { dateTime: googleTask.dateStart }
        })
      )

      if (matchingGoogleEvent) {
        // If there's a matching Google event, prefer the local task but add Google metadata
        combinedEvents.push({
          ...localTask,
          htmlLink: matchingGoogleEvent.htmlLink,
          creator: matchingGoogleEvent.creator,
          organizer: matchingGoogleEvent.organizer,
          etag: matchingGoogleEvent.etag,
          kind: matchingGoogleEvent.kind,
          // Keep local task's local flag but note it has Google counterpart
          hasGoogleCounterpart: true
        })
      } else {
        // No matching Google event, add local task as is
        combinedEvents.push(localTask)
      }
    })

    // Add Google events that don't have local counterparts
    googleTaskEvents.forEach(googleTask => {
      const hasLocalCounterpart = localTasksWithDates.some(localTask => 
        isTaskMatchingGoogleEvent(localTask, {
          id: googleTask.googleEventId,
          summary: googleTask.task,
          start: { dateTime: googleTask.dateStart }
        })
      )

      if (!hasLocalCounterpart) {
        combinedEvents.push(googleTask)
      }
    })

    console.log("✅ Combined events for calendar:", combinedEvents.length)
    
    // Show info about tasks without dates
    const tasksWithoutDates = allLocalTasks.length - localTasksWithDates.length
    if (tasksWithoutDates > 0) {
      console.log(`ℹ️ ${tasksWithoutDates} local tasks without dates are not shown in calendar`)
    }

    return combinedEvents
  }

  // Get combined events
  const allEvents = combineTasksAndGoogleEvents()

  // Convert to calendar events format
  const taskEvents = allEvents.map((task) => {
    const startDate = new Date(task.dateStart)
    const endDate = task.dateEnd ? new Date(task.dateEnd) : startDate

    const event = {
      ...task,
      title: task.task || task.title,
      start: startDate,
      end: endDate,
      // Color based on task type and completion status
      color: task.completed
        ? "#0F9D58" // Verde para completadas
        : task.local === false 
          ? "#EA4335" // Rojo para eventos de Google Calendar
          : "#4285F4", // Azul para tareas locales
    }
    return event
  })

  // Show message if no events
  if (taskEvents.length === 0) {
    console.warn("No hay eventos para mostrar en el calendario")
  }

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: "8px",
      opacity: 0.9,
      color: "white",
      border: "0",
      display: "block",
      fontWeight: "600",
      padding: "4px",
      fontSize: "14px",
    }
    return {
      style: style,
    }
  }

  const onView = (newView) => {
    setView(newView)
  }

  const handleSelectEvent = (task) => {
    setSelectedTask(task)
  }

  return (
    <div className="h-[700px] p-4 bg-notion-bg dark:bg-notion-dark rounded-lg shadow-lg">
      {/* Legend for event types */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Local Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Google Calendar Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        {/* Show info about tasks without dates */}
        {tasks && tasks.length > 0 && (
          <div className="text-xs text-gray-500 ml-auto">
            {tasks.filter(t => !t.dateStart).length > 0 && (
              <span>
                ℹ️ {tasks.filter(t => !t.dateStart).length} tasks without dates not shown
              </span>
            )}
          </div>
        )}
      </div>

      <Calendar
        localizer={localizer}
        events={taskEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        eventPropGetter={eventStyleGetter}
        formats={{
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer.format(start, "HH:mm", culture) + " - " + localizer.format(end, "HH:mm", culture),
        }}
        components={{
          event: EventComponent,
          toolbar: (toolbarProps) => <CustomToolbar {...toolbarProps} view={view} onView={onView} />,
        }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={onView}
        onSelectEvent={handleSelectEvent}
      />
      <TaskDetailsDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onComplete={onCompleteTask}
        onEditGoogleEvent={onEditGoogleEvent}
        onDeleteGoogleEvent={onDeleteGoogleEvent}
      />
    </div>
  )
}

const EventComponent = ({ event }) => (
  <div className="p-2 relative">
    <div className="font-bold text-sm">{event.title}</div>
    {event.local === false && (
      <div className="absolute top-1 right-1">
        <CalendarIcon className="h-3 w-3 text-white opacity-80" />
      </div>
    )}
    {event.hasGoogleCounterpart && (
      <div className="absolute top-1 left-1">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-80"></div>
      </div>
    )}
  </div>
)

const CustomToolbar = ({ onNavigate, date, view, onView }) => {
  const goToBack = () => {
    onNavigate("PREV")
  }

  const goToNext = () => {
    onNavigate("NEXT")
  }

  const goToCurrent = () => {
    onNavigate("TODAY")
  }

  const label = () => {
    const dateObj = moment(date)
    return <span className="text-lg sm:text-xl font-semibold">{dateObj.format("MMMM YYYY")}</span>
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <button onClick={goToBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={goToNext} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {label()}
        <button
          onClick={goToCurrent}
          className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          Hoy
        </button>
      </div>
      <div className="flex space-x-2 w-full sm:w-auto">
        {[
          { label: "Mes", value: Views.MONTH },
          { label: "Semana", value: Views.WEEK },
          { label: "Día", value: Views.DAY },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onView(value)}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
              view === value ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

const TaskDetailsDialog = ({ task, onClose, onEdit, onDelete, onComplete, onEditGoogleEvent, onDeleteGoogleEvent }) => {
  if (!task) return null

  // Check if this is a Google Calendar event
  const isGoogleEvent = task.local === false || task.googleEventId
  const isLocalTask = task.local !== false && !task.googleEventId
  const hasGoogleCounterpart = task.hasGoogleCounterpart
  const isPureGoogleEvent = isGoogleEvent && !hasGoogleCounterpart

  const handleEditClick = () => {
    if (isPureGoogleEvent) {
      // For pure Google events, use the Google event edit handler
      onEditGoogleEvent(task)
    } else {
      // For local tasks or synced tasks, use the regular edit handler
      onEdit(task)
    }
  }

  const handleDeleteClick = () => {
    if (isPureGoogleEvent) {
      // For pure Google events, use the Google event delete handler
      onDeleteGoogleEvent(task.googleEventId)
    } else {
      // For local tasks or synced tasks, use the regular delete handler
      onDelete(task.id)
    }
  }

  // FIXED: Allow completion for local tasks that are synced with Google Calendar
  const canComplete = !task.completed && (isLocalTask || hasGoogleCounterpart)

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark rounded-lg shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {task.task || task.title}
            {isGoogleEvent && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Google
              </Badge>
            )}
            {hasGoogleCounterpart && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Synced
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-3">
          <p>
            <strong>Description:</strong> {task.description || "Sin descripción"}
          </p>
          <p>
            <strong>Start Date:</strong> {task.dateStart ? new Date(task.dateStart).toLocaleString() : "Not set"}
          </p>
          {task.dateEnd && (
            <p>
              <strong>End Date:</strong> {new Date(task.dateEnd).toLocaleString()}
            </p>
          )}
          {task.timeZone && (
            <p>
              <strong>Timezone:</strong> {task.timeZone}
            </p>
          )}
          <p>
            <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
          </p>
          <p>
            <strong>Type:</strong> {isGoogleEvent ? "Google Calendar Event" : "Local Task"}
            {hasGoogleCounterpart && " (Synced with Google)"}
          </p>

          {/* Google Calendar specific information */}
          {isGoogleEvent && (
            <div className="space-y-2">
              {task.creator && (
                <p>
                  <strong>Creator:</strong> {task.creator.email}
                </p>
              )}
              {task.htmlLink && (
                <p>
                  <strong>Google Calendar Link:</strong>{" "}
                  <a 
                    href={task.htmlLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Open in Google Calendar
                  </a>
                </p>
              )}
            </div>
          )}

          {/* Reminder Information */}
          {(task.reminderMinutesPopup || task.reminderMinutesEmail) && (
            <div className="space-y-2">
              <strong>Reminders:</strong>
              <div className="flex flex-wrap gap-2">
                {task.reminderMinutesPopup && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Bell className="h-3 w-3" />
                    Popup: {task.reminderMinutesPopup}min
                  </Badge>
                )}
                {task.reminderMinutesEmail && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email: {task.reminderMinutesEmail}min
                  </Badge>
                )}
              </div>
            </div>
          )}
        </DialogDescription>
        <div className="flex justify-end space-x-4 mt-4">
          {/* Show edit and delete buttons for all events now */}
          <Button onClick={handleEditClick} className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={handleDeleteClick} className="bg-red-500 hover:bg-red-600 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          
          {/* FIXED: Complete button for local tasks and synced tasks */}
          {canComplete && (
            <Button
              onClick={() => onComplete(task.id)}
              className="bg-notion-orange hover:bg-notion-orange-dark text-white"
            >
              Complete
            </Button>
          )}
          
          {/* Show additional info for different task types */}
          {isPureGoogleEvent && (
            <div className="text-xs text-gray-500 mt-2">
              <p>📅 Google Calendar Event - Editable via this interface</p>
            </div>
          )}
          {hasGoogleCounterpart && (
            <div className="text-xs text-gray-500 mt-2">
              <p>🔄 Local task synced with Google Calendar - Can be completed here</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskCalendar