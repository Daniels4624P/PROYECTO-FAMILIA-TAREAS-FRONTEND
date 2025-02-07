"use client"

import { useState, useEffect, useCallback } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { fetchTasksForMonth } from "../utils/api"
import { useTheme } from "../contexts/ThemeContext"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const MonthlyTasksChart = () => {
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Tasks Completed",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  })

  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      console.log(`Fetching data for year: ${year}, month: ${month}`) // Log para depuración
      const response = await fetchTasksForMonth(token, year, month)
      const taskData = response.data

      console.log("Task Data:", taskData)

      const labels = []
      const data = new Array(5).fill(0)

      const startDate = new Date(year, month - 1, 1)
      for (let i = 0; i < 5; i++) {
        const weekDate = new Date(startDate)
        weekDate.setDate(startDate.getDate() + i * 7)
        labels.push(weekDate.toLocaleDateString("es-ES", { month: "short", day: "numeric" }))
      }

      taskData.forEach((item) => {
        const itemDate = new Date(item.week)
        const weekIndex = Math.floor((itemDate.getDate() - 1) / 7)
        data[weekIndex] = Number.parseInt(item.taskCount, 10)
      })

      setChartData({
        labels,
        datasets: [
          {
            label: "Tasks Completed",
            data,
            borderColor: isDarkMode ? "rgb(129, 140, 248)" : "rgb(75, 192, 192)",
            backgroundColor: isDarkMode ? "rgba(129, 140, 248, 0.5)" : "rgba(75, 192, 192, 0.5)",
            tension: 0.1,
          },
        ],
      })
    } catch (error) {
      console.error("Error fetching task data:", error)
    }
  }, [year, month, isDarkMode])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleYearChange = (e) => {
    setYear(Number.parseInt(e.target.value))
  }

  const handleMonthChange = (e) => {
    setMonth(Number.parseInt(e.target.value))
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Tasks Completed per Week",
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-notion-text dark:text-notion-text-dark">
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={handleYearChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-notion-text dark:text-notion-text-dark">
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={handleMonthChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className={`p-4 rounded-lg shadow ${isDarkMode ? "bg-notion-dark" : "bg-white"}`}>
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}

export default MonthlyTasksChart

