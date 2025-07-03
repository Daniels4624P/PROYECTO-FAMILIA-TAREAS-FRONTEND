"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

const localizer = momentLocalizer(moment)

const TaskCalendar = ({ tasks, onEditTask, onDeleteTask, onCompleteTask }) => {
  const [view, setView] = useState(Views.MONTH)
  const [selectedTask, setSelectedTask] = useState(null)

  // Filtrar y mapear las tareas para el calendario
  const taskEvents =
    tasks
      ?.filter((task) => {
        const hasDateStart = task.dateStart && task.dateStart !== null && task.dateStart !== undefined
        return hasDateStart
      })
      .map((task) => {
        const startDate = new Date(task.dateStart)
        const endDate = task.dateEnd ? new Date(task.dateEnd) : startDate

        const event = {
          ...task,
          title: task.task,
          start: startDate,
          end: endDate,
          // Color basado en el estado de la tarea
          color: task.dateEnd ? "#0F9D58" : task.completed ? "#FF9800" : "#4285F4",
        }
        return event
      }) || []

  // Mostrar mensaje si no hay eventos
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
      />
    </div>
  )
}

const EventComponent = ({ event }) => (
  <div className="p-2">
    <div className="font-bold text-sm">{event.title}</div>
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

const TaskDetailsDialog = ({ task, onClose, onEdit, onDelete, onComplete }) => {
  if (!task) return null

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle>{task.task}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>
            <strong>Description:</strong> {task.description || "Sin descripción"}
          </p>
          <p>
            <strong>Start Date:</strong> {task.dateStart ? new Date(task.dateStart).toLocaleString() : "Not set"}
          </p>
          {task.dateEnd && (
            <p>
              <strong>Completed Date:</strong> {new Date(task.dateEnd).toLocaleString()}
            </p>
          )}
          <p>
            <strong>Status:</strong>{" "}
            {task.dateEnd ? "Completed" : task.completed ? "Completed (no end date)" : "Pending"}
          </p>
        </DialogDescription>
        <div className="flex justify-end space-x-4 mt-4">
          <Button onClick={() => onEdit(task)} className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => onDelete(task.id)} className="bg-red-500 hover:bg-red-600 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          {!task.dateEnd && (
            <Button
              onClick={() => onComplete(task.id)}
              className="bg-notion-orange hover:bg-notion-orange-dark text-white"
            >
              Complete
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskCalendar
