import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import { Home, Menu, MessageCircle, X } from 'lucide-react'
import logo from '/icons/logo.svg';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="fixed w-full py-4 px-6 flex items-center justify-between bg-white/70 backdrop-blur-md text-charcoal shadow-lg">
        <div className="flex flex-row gap-6">
          <img src={logo} alt="" />
          <h1 className="text-xl font-bold">NutriLens</h1>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
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
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-gray-200 transition-colors mb-2"
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          {/* Demo Links Start */}
          <Link
            to="/chat"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-gray-200 transition-colors mb-2"
          >
            <MessageCircle size={20} />
            <span className="font-medium">Chat</span>
          </Link>

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  )
}
