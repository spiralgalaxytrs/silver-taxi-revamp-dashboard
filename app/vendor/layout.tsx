'use client'
import Sidebar from 'components/menubar/Sidebar'
import { UserNav } from 'components/menubar/UserNav'
import { NotificationCenter } from 'components/others/NotificationCenter'
import { useEffect, useState } from 'react'
import Unauthorized from 'components/others/UnAuthorized'
import Loading from 'app/Loading'
import { SocketProvider } from 'providers/websocket/SocketProvider'
import { TooltipProvider } from 'components/ui/tooltip'

type AuthState = {
  token: string | null,
  role: string | null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthorized, setIsAuthorized] = useState<AuthState>({
    token: "",
    role: ""
  })

  useEffect(() => {
    const getToken: string | null = sessionStorage.getItem('token')
    const getRole: string | null = sessionStorage.getItem('role')
    setIsAuthorized({
      token: getToken,
      role: getRole
    })
    setLoading(false)
  }, [])

  if (loading) {
    return <Loading />
  }

  if (isAuthorized.token === "") {
    return <Unauthorized />
  }

  if (isAuthorized.role !== "vendor") {
    return <Unauthorized />
  }

  return (
    <SocketProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar createdBy={isAuthorized.role as string} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
            <h1 className="text-2xl font-semibold text-gray-800 invisible">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <NotificationCenter createdBy={isAuthorized.role as string} />
              <UserNav createdBy={isAuthorized.role as string} />
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </div>
          </main>
        </div>
      </div>
    </SocketProvider>
  )
}

