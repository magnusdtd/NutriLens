import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import logo from '/icons/logo.svg'
import { useState } from 'react'
import login from '@/services/login.service'
import { useAuthStore } from '@/stores/auth.store'
import getProfile from '@/services/profile.service'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>()
  const [password, setPassword] = useState<string>()
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const response = await login({
        email: email || '',
        password: password || '',
      })
      if (response) {
        const token = response.token
        setToken(token || null)
        const userProfile = token ? await getProfile(token) : null
        console.log(userProfile)
        if (userProfile) {
          setUser(userProfile)
          setIsAuthenticated(true)
          navigate({to: '/'})
        }
      }
    } catch (error) {
      console.error('Login failed', error)
    }
  }
  return (
    <div className="h-full w-full max-w-sm p-6 flex flex-col gap-6">
      <div className="flex flex-col items-center justify-center">
        <img className="size-10 lg:size-8" src={logo} alt="" />
        <h1 className="text-2xl lg:text-xl font-medium">NutriLens</h1>
        <p className="text-base lg:text-sm text-gray-600">
          AI-Powered Meal Analysis
        </p>
      </div>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          handleSubmit(e)
        }}
        className="w-full flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-base lg:text-sm font-medium" htmlFor="">
            Email
          </label>
          <input
            className="p-2 px-4 bg-white border border-gray-200 rounded-md text-sm lg:text-xs"
            placeholder="example@gmail.com"
            type="text"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value)
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-base lg:text-sm font-medium" htmlFor="">
            Password
          </label>
          <input
            className="p-2 px-4 bg-white border border-gray-200 rounded-md text-sm lg:text-xs"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value)
            }}
          />
        </div>
        <button className="w-full p-3 text-sm lg:text-xs text-white bg-yellow-green-dark rounded-md">
          Login
        </button>
        <div className="flex flex-row flex-wrap justify-center">
          <p className="text-center text-sm lg:text-xs">
            Don't have an account?{' '}
            <Link to="/signup">
              <span className="text-yellow-green-dark hover:underline cursor-pointer">
                Sign up here
              </span>
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
