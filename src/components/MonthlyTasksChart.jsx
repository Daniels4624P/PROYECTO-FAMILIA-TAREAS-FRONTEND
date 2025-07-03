"use client"

import { useState, useEffect } from "react"
import { fetchTasksForMonth } from "../utils/api"
import Loader from "./Loader"

function MonthlyTasksChart() {
  const [taskData, setTaskData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching tasks for:", { year: selectedYear, month: selectedMonth })

        const response = await fetchTasksForMonth(selectedYear, selectedMonth)
        console.log("API Response:", response.data)

        setTaskData(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error("Error fetching task data:", error)
        setError(error.response?.data?.message || error.message || "Failed to fetch task data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth])

  const handleYearChange = (e) => {
    setSelectedYear(Number.parseInt(e.target.value))
  }

  const handleMonthChange = (e) => {
    setSelectedMonth(Number.parseInt(e.target.value))
  }

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)

  // Preparar datos para la gráfica
  const chartData = taskData.map((item, index) => ({
    week: `Week ${index + 1}`,
    tasks: Number.parseInt(item.taskCount || item.taskcount || 0),
    date: item.week ? new Date(item.week).toLocaleDateString() : `Week ${index + 1}`,
  }))

  const maxTasks = Math.max(...chartData.map((item) => item.tasks), 1)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-notion-bg dark:bg-notion-dark">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-red-500">Error Loading Tasks</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-notion-orange hover:bg-notion-orange-dark text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex flex-col">
            <label htmlFor="year" className="text-sm font-medium mb-1">
              Year
            </label>
            <select
              id="year"
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-notion-gray dark:bg-notion-dark border border-notion-gray-dark dark:border-gray-600 rounded px-3 py-2 text-notion-text dark:text-notion-text-dark"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="month" className="text-sm font-medium mb-1">
              Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="bg-notion-gray dark:bg-notion-dark border border-notion-gray-dark dark:border-gray-600 rounded px-3 py-2 text-notion-text dark:text-notion-text-dark"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">
          Tasks for {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
        </h2>
      </div>

      {/* Gráfica de barras */}
      {chartData.length > 0 && (
        <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Weekly Tasks Chart</h3>
          <div className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium">{item.week}</div>
                <div className="flex-1 bg-notion-gray dark:bg-gray-800 rounded-full h-8 relative">
                  <div
                    className="bg-notion-orange dark:bg-notion-orange-dark h-8 rounded-full flex items-center justify-end pr-2 transition-all duration-300"
                    style={{
                      width: `${Math.max((item.tasks / maxTasks) * 100, 5)}%`,
                    }}
                  >
                    <span className="text-white text-sm font-bold">{item.tasks}</span>
                  </div>
                </div>
                <div className="w-24 text-xs text-notion-text-light dark:text-gray-400">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Información detallada */}
      {taskData.length > 0 ? (
        <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Detailed Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {taskData.map((item, index) => (
              <div
                key={index}
                className="bg-notion-gray dark:bg-gray-800 p-4 rounded-lg border border-notion-gray-dark dark:border-gray-600"
              >
                <h4 className="font-semibold mb-2">Week {index + 1}</h4>
                <p className="text-notion-orange dark:text-notion-orange-dark font-bold text-xl">
                  {item.taskCount || item.taskcount || 0} tasks
                </p>
                {item.week && (
                  <p className="text-sm text-notion-text-light dark:text-gray-400 mt-1">
                    Week of: {new Date(item.week).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 bg-notion-gray dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Summary</h4>
            <p className="text-notion-text dark:text-notion-text-dark">
              Total tasks completed:{" "}
              <span className="font-bold text-notion-orange dark:text-notion-orange-dark">
                {taskData.reduce((total, item) => total + Number.parseInt(item.taskCount || item.taskcount || 0), 0)}
              </span>
            </p>
            <p className="text-notion-text dark:text-notion-text-dark">
              Average per week:{" "}
              <span className="font-bold text-notion-orange dark:text-notion-orange-dark">
                {(
                  taskData.reduce((total, item) => total + Number.parseInt(item.taskCount || item.taskcount || 0), 0) /
                  taskData.length
                ).toFixed(1)}
              </span>
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg text-center">
          <p className="text-notion-text-light dark:text-gray-400 mb-4">
            No tasks found for {months.find((m) => m.value === selectedMonth)?.label} {selectedYear}
          </p>
          <p className="text-sm text-notion-text-light dark:text-gray-400">
            Try selecting a different month or year, or complete some tasks first.
          </p>
        </div>
      )}
    </div>
  )
}

export default MonthlyTasksChart
