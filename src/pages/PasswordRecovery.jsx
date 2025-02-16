"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { sendRecoveryEmail } from "../utils/api"

const PasswordRecovery = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setMessage("")
    try {
      const response = await sendRecoveryEmail(data.email)
      setMessage("Recovery email sent. Please check your inbox.")
    } catch (error) {
      setMessage("Error sending recovery email. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-notion-bg dark:bg-notion-dark flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-notion-dark-light rounded-lg shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-notion-text dark:text-notion-text-dark">
          Password Recovery
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-notion-text dark:text-notion-text-dark">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-notion-bg dark:bg-notion-dark border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
              })}
            />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              {isSubmitting ? "Sending..." : "Send Recovery Email"}
            </button>
          </div>
        </form>
        {message && (
          <div
            className={`mt-4 p-4 rounded-md ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default PasswordRecovery

