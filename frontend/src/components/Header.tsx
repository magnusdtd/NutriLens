import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { CircleUserRound, Home, Menu, MessageCircle, X } from 'lucide-react'
import logo from '/icons/logo.svg'
import { useAuthStore } from '@/stores/auth.store'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const isAuthenticated = useAuthStore((state) => (state.isAuthenticated))
  const user = useAuthStore((state) => (state.user))
  const logout = useAuthStore((state)=>(state.logout))
  const navigate = useNavigate({ from: '/' })

  function handleLogout() {
    logout()
    setIsOpen(false)
    navigate({ to: '/login' })
  }

  return (
    <>
      <header className="fixed w-full py-4 px-6 flex items-center justify-between bg-white/70 backdrop-blur-md text-charcoal shadow-lg">
        <div className="flex flex-row gap-6">
          <img src={logo} alt="" />
          <h1 className="text-xl lg:text-2xl font-bold">NutriLens</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </button>
      </header>

      <aside
        className={`fixed top-0 right-0 h-full w-70 bg-white text-charcoal shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="size-6 " />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-gray-200 transition-colors mb-2"
          >
            <Home className="size-6" />
            <span className="font-medium text-lg">Home</span>
          </Link>

          {/* Demo Links Start */}
          <Link
            to="/chat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-gray-200 transition-colors mb-2"
          >
            <MessageCircle className="size-6" />
            <span className="font-medium text-lg">Chat</span>
          </Link>

          {/* Demo Links End */}
          <div className="my-4 h-px w-full bg-gray-200" />
          {isAuthenticated ? (
            <div className='flex flex-col gap-2'>
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-gray-200 transition-colors mb-2"
              >
                <CircleUserRound className="size-6 lg:size-5" />
                <span className="font-medium text-lg">
                  {user?.username}'s Profile
                </span>
              </Link>
              <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white text-sm font-medium rounded-lg py-3 shadow-md">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-row gap-4">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="p-2 px-6 border border-primary text-primary text-base font-medium rounded-full bg-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="p-2 px-6 border border-primary text-white text-base font-medium rounded-full bg-primary"
              >
                Join now
              </Link>
            </div>
          )}
        </nav>
      </aside>
    </>
  )
}
