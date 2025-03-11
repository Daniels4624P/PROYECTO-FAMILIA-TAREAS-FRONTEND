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

  const taskEvents = tasks.map((task) => ({
    ...task,
    title: task.task,
    start: new Date(task.date || task.createdAt),
    end: new Date(task.date || task.createdAt),
    color: task.completed ? "#0F9D58" : "#4285F4",
  }))

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: "4px",
      opacity: 0.8,
      color: "white",
      border: "0",
      display: "block",
      fontWeight: "500",
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
    <div className="h-[600px] p-2 sm:p-4 bg-notion-bg dark:bg-notion-dark">
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
  <div className="p-1">
    <div className="font-medium text-sm">{event.title}</div>
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
    return <span className="text-lg sm:text-xl font-medium">{dateObj.format("MMMM YYYY")}</span>
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <button onClick={goToBack} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
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
        <button onClick={goToNext} className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
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
          className="ml-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          Hoy
        </button>
      </div>
      <div className="flex space-x-1 sm:space-x-2 w-full sm:w-auto">
        {[
          { label: "Mes", value: Views.MONTH },
          { label: "Semana", value: Views.WEEK },
          { label: "Día", value: Views.DAY },
        ].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onView(value)}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200 ${
              view === value ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
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
      <DialogContent className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark">
        <DialogHeader>
          <DialogTitle>{task.task}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <p>
            <strong>Description:</strong> {task.description}
          </p>
          <p>
            <strong>Date:</strong> {task.date ? new Date(task.date).toLocaleDateString() : "Not set"}
          </p>
          <p>
            <strong>Status:</strong> {task.completed ? "Completed" : "Pending"}
          </p>
        </DialogDescription>
        <div className="flex justify-end space-x-2 mt-4">
          <Button onClick={() => onEdit(task)} className="bg-notion-gray hover:bg-notion-gray-dark text-notion-text">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button onClick={() => onDelete(task.id)} className="bg-red-500 hover:bg-red-600 text-white">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          {!task.completed && (
            <Button
              onClick={() => onComplete(task.id, task.folderId)}
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

