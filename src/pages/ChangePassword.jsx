"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { changePassword } from "../utils/api"
import { useRouter } from "next/router"

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const { token } = router.query

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setMessage("")
    try {
      await changePassword(token, data.newPassword)
      setMessage("Password changed successfully. You can now log in with your new password.")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      setMessage("Error changing password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-notion-bg dark:bg-notion-dark flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-notion-dark-light rounded-lg shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-notion-text dark:text-notion-text-dark">
          Change Password
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-notion-text dark:text-notion-text-dark"
            >
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-notion-bg dark:bg-notion-dark border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 8, message: "Password must be at least 8 characters long" },
              })}
            />
            {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-notion-text dark:text-notion-text-dark"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-notion-bg dark:bg-notion-dark border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) => value === watch("newPassword") || "Passwords do not match",
              })}
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-notion-orange hover:bg-notion-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-notion-orange"
            >
              {isSubmitting ? "Changing Password..." : "Change Password"}
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

export default ChangePassword

