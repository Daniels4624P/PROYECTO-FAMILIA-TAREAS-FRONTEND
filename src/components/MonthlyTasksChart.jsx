"use client"

import { useState, useEffect } from "react"
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const MonthlyTasksChart = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetchTasksForMonth(token, year, month)
        const taskData = response.data
        console.log(taskData)

        // Asumiendo que 'week' es una cadena de fecha ISO
        const labels = taskData.map((item) => {
          const date = new Date(item.week)
          return date.toLocaleDateString("es-ES", { month: "short", day: "numeric" })
        })
        const data = taskData.map((item) => item.taskCount)

        setChartData({
          labels,
          datasets: [
            {
              label: "Tasks Completed",
              data,
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching task data:", error)
      }
    }

    fetchData()
  }, [year, month])

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
        text: "Monthly Tasks Completed",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Week",
        },
      },
      y: {
        title: {
          display: true,
          text: "Tasks Completed",
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <select
            id="year"
            value={year}
            onChange={handleYearChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i} value={new Date().getFullYear() - i}>
                {new Date().getFullYear() - i}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select
            id="month"
            value={month}
            onChange={handleMonthChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <Line options={options} data={chartData} />
      </div>
    </div>
  )
}

export default MonthlyTasksChart

