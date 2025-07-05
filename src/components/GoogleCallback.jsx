"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { handleGoogleCallback } from "../utils/api"
import Loader from "./Loader"

function GoogleCallback() {
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
          setTimeout(() => navigate("/login"), 3000)
          return
        }

        if (!state || !code) {
          console.error("❌ Missing state or code parameters")
          setError("Invalid callback parameters.")
          setTimeout(() => navigate("/login"), 3000)
          return
        }

        console.log("🔄 Processing Google callback...")
        const response = await handleGoogleCallback(state, code)

        if (response.data) {
          console.log("✅ Google login successful:", response.data)
          setUser(response.data)
          navigate("/profile")
        } else {
          throw new Error("No user data received")
        }
      } catch (error) {
        console.error("❌ Google callback failed:", error)
        setError("Failed to complete Google authentication.")
        setTimeout(() => navigate("/login"), 3000)
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
          <p className="text-sm text-notion-text-light dark:text-notion-text-dark">Redirecting to login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-notion-bg dark:bg-notion-dark">
      <Loader size="large" />
      <p className="mt-4 text-notion-text dark:text-notion-text-dark">Completing Google authentication...</p>
    </div>
  )
}

export default GoogleCallback
