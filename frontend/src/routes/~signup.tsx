import { createFileRoute, Link } from '@tanstack/react-router'
import logo from '/icons/logo.svg'
import { useState } from 'react'

export const Route = createFileRoute('/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const [username, setUsername] = useState<string>()
  const [email, setEmail] = useState<string>()  
  const [password, setPassword] = useState<string>()
  const [confirmPassword, setConfirmPassword] = useState<string>()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log(email)
    console.log(password)
  }
  return (
    <div className="h-full w-full lg:w-1/3 p-6 flex flex-col gap-6">
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
            Username
          </label>
          <input
            className="p-2 px-4 bg-white border border-gray-200 rounded-md text-sm lg:text-xs"
            placeholder="Your Name"
            type="text"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setUsername(e.target.value)
            }}
          />
        </div>
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
        <div className="flex flex-col gap-2">
          <label className="text-base lg:text-sm font-medium" htmlFor="">
            Confirm password
          </label>
          <input
            className="p-2 px-4 bg-white border border-gray-200 rounded-md text-sm lg:text-xs"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value)
            }}
          />
        </div>
        <button className="w-full p-3 text-white text-sm lg:text-xs bg-yellow-green-dark rounded-md">
          Sign up
        </button>
        <div className="flex flex-row flex-wrap justify-center">
          <p className="text-center text-sm lg:text-xs">
            Already have an account?{' '}
            <Link to="/login">
              <span className="text-yellow-green-dark hover:underline cursor-pointer">
                Login here
              </span>
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
