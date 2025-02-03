import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getUser } from "../utils/api"

function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Aquí deberías tener un endpoint para obtener todos los usuarios
        // Por ahora, simularemos con el usuario actual
        const userData = await getUser(user.id)
        setUsers([userData.data])
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }

    if (user && user.isAdmin) {
      fetchUsers()
    }
  }, [user])

  if (!user || !user.isAdmin) {
    return <div>Access denied. Admin only.</div>
  }

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Users

