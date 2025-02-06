import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState("")
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password)
      navigate("/profile")
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError("Invalid email or password. Please try again.")
    }
  }

  return (
    <Card className="w-[350px] mx-auto mt-10 bg-notion-bg dark:bg-notion-dark">
      <CardHeader>
        <CardTitle className="text-notion-text dark:text-notion-text-dark">Login</CardTitle>
        <CardDescription className="text-notion-text-light dark:text-notion-text-dark">
          Access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {loginError && (
            <div className="text-sm text-red-500">
              {loginError}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-notion-text dark:text-notion-text-dark">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-notion-text dark:text-notion-text-dark">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-notion-bg dark:bg-notion-dark text-notion-text dark:text-notion-text-dark"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-notion-orange hover:bg-notion-orange-dark text-white">
            Login
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default Login
