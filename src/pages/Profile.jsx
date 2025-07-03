"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUserProfile, getUserHistory } from "../utils/api"
import Loader from "../components/Loader"

function Profile() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [profileData, historyData] = await Promise.all([getUserProfile(), getUserHistory()])
        setProfile(profileData.data)
        setHistory(Array.isArray(historyData.data) ? historyData.data : [])
      } catch (error) {
        console.error("Error fetching profile data:", error)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, []) // Array vacío - solo se ejecuta una vez al montar

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-notion-bg dark:bg-notion-dark">
        <Loader size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-notion-text dark:text-notion-text-dark p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-notion-text dark:text-notion-text-dark p-6 text-center">No profile data available.</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p className="mb-2">Name: {profile.name}</p>
        <p className="mb-2">Email: {profile.email}</p>
        <p className="mb-4 text-notion-orange dark:text-notion-orange-dark font-medium">
          Points: {profile.points !== undefined ? profile.points : "Not available"}
        </p>
      </div>

      <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Task History</h2>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="border-b border-notion-gray dark:border-notion-text-dark pb-2">
                <span className="font-medium">Task: {item.taskId}</span>
                <span className="ml-4 text-notion-text-light dark:text-notion-text-dark">
                  Completed on: {item.hecha}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No task history available.</p>
        )}
      </div>
    </div>
  )
}

export default Profile
