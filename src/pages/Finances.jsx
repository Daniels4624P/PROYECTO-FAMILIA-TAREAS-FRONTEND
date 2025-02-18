"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { exportFinances } from "../utils/api"
import { Download } from "lucide-react"

const Finances = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const onSubmit = async (data) => {
    setIsLoading(true)
    setMessage("")
    try {
      const response = await exportFinances(data.year, data.month)

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "text/csv" })

      // Create a link element and trigger the download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `finances-${data.year}-${data.month}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage("File downloaded successfully!")
    } catch (error) {
      console.error("Error exporting finances:", error)
      setMessage("Error downloading file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#202020] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Export Finances</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Year</label>
              <select
                {...register("year", { required: "Year is required" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              >
                <option value="">Select year</option>
                {[...Array(10)].map((_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  )
                })}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Month</label>
              <select
                {...register("month", { required: "Month is required" })}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-[#2D2D2D] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-notion-orange focus:border-transparent"
              >
                <option value="">Select month</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              {errors.month && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.month.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                "Exporting..."
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${
              message.includes("Error")
                ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200"
                : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default Finances

