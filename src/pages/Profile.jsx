import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, getUserHistory, getUserPoints } from '../utils/api'

function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [points, setPoints] = useState(0)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile()
        setProfile(profileData.data)

        const historyData = await getUserHistory(user.id)
        setHistory(historyData.data)
      } catch (error) {
        console.error('Error fetching profile data:', error)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user]) // Eliminamos `points` de las dependencias

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const token = localStorage.getItem("token")
        const pointsData = await getUserProfile()
        setPoints(pointsData.data.points)
      } catch (error) {
        console.error('Error fetching points:', error)
      }
    }

    if (user) {
      fetchPoints()
    }
  }, [user]) // Llamamos a los puntos en un `useEffect` separado

  if (!profile) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Points: {points}</p>
      <h3>History</h3>
      <ul>
        {history.map((item, index) => (
          <li key={index}>{item.description}</li>
        ))}
      </ul>
    </div>
  )
}

export default Profile
