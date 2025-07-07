"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { tasksGoogleCallback } from "../utils/api"
import Loader from "./Loader"

function TasksGoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [error, setError] = useState("")

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        const state = searchParams.get("state")
        const code = searchParams.get("code")
        const error = searchParams.get("error")

        if (error) {
          console.error("❌ Google OAuth error:", error)
          setError("Google authentication was cancelled or failed.")
          setTimeout(() => navigate("/profile"), 3000)
          return
        }

        if (!state || !code) {
          console.error("❌ Missing state or code parameters")
          setError("Invalid callback parameters.")
          setTimeout(() => navigate("/profile"), 3000)
          return
        }

        console.log("🔄 Processing Google callback...")
        const response = await tasksGoogleCallback(state, code)

        if (!response) {
          console.log("✅ Google Authorization successful:", response.data)
          navigate("/profile")
        } else {
          throw new Error("No user data received")
        }
      } catch (error) {
        console.error("❌ Google callback failed:", error)
        setError("Failed to complete Google authentication.")
        setTimeout(() => navigate("/profile"), 3000)
      }
    }

    processGoogleCallback()
  }, [searchParams, navigate, setUser])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-notion-bg dark:bg-notion-dark">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-notion-text dark:text-notion-text-dark mb-2">
            Authentication Error
          </h2>
          <p className="text-notion-text-light dark:text-notion-text-dark mb-4">{error}</p>
          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">Redirecting to profile page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-notion-bg dark:bg-notion-dark">
      <Loader size="large" />
      <p className="mt-4 text-notion-text dark:text-notion-text-dark">Completing Google authorization...</p>
    </div>
  )
}

export default TasksGoogleCallback
