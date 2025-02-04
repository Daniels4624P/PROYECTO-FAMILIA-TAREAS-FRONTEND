import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUserProfile } from "../utils/api"
import Loader from "../components/Loader"

function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          setLoading(true)
          const profileData = await getUserProfile()
          setProfile(profileData.data)
        } catch (error) {
          console.error("Error fetching profile data:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfileData()
  }, [user])

  if (loading) {
    return <Loader size="large" />
  }

  if (!profile) {
    return <div className="text-notion-text dark:text-notion-text-dark">No profile data available.</div>
  }

  return (
    <div className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <p className="mb-2">Name: {profile.name}</p>
      <p className="mb-2">Email: {profile.email}</p>
      <p className="mb-4 text-notion-orange dark:text-notion-orange-dark font-medium">
        Points: {profile.points !== undefined ? profile.points : "Not available"}
      </p>
    </div>
  )
}

export default Profile

