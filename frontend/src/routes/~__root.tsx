import { Outlet, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
// import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '@/components/Header'
import { useAuthStore } from '@/stores/auth.store'
import getProfile from '@/services/profile.service'

function RootComponent() {
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)
  const setToken = useAuthStore((state) => state.setToken)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    setToken(token)
    setIsAuthenticated(true)

    const hydrateProfile = async () => {
      const profile = await getProfile(token)
      if (profile) setUser(profile)
    }
    hydrateProfile()
  }, [setIsAuthenticated, setToken, setUser])

  return (
    <>
      <Header />
      <div className="pt-18 h-screen w-screen flex items-center justify-center">
        <Outlet />
      </div>
      {/* <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      /> */}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
