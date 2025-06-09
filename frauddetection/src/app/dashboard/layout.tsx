'use client'

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"
import { AppSidebar } from "@/components/app-sidebar"
import { UserSidebar } from "@/components/user-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { getCookie } from "@/lib/handle-cookies"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    const token = getCookie('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const decodedToken = jwtDecode(token) as { 
        Role?: string;
        role?: string;
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
      }
      
      // Check all possible role formats and normalize to lowercase
      const userRole = (
        decodedToken.Role || 
        decodedToken.role || 
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
        ''
      ).toLowerCase()

      console.log('DashboardLayout - Decoded token:', decodedToken)
      console.log('DashboardLayout - User role:', userRole)
      
      setIsAdmin(userRole === 'admin')
    } catch (error) {
      console.error('Error processing token:', error)
      router.push('/login')
    }
  }, [router])

  return (
    <SidebarProvider>
      {isAdmin ? <AppSidebar /> : <UserSidebar />}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">{isAdmin ? "Admin" : "User"} Dashboard</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
