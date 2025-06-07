'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { Claim } from "./claims/page"
import { User } from "./users/page"


export default function DashboardPage() {
  // States for users, claims, and loading/error handling
  const [users, setUsers] = useState<User[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  // Fetch users and claims data when the component mounts
  useEffect(() => {
    const fetchUsersAndClaims = async () => {
      try {
        const userResponse = await fetch('http://localhost:8000/api/Accounts/GetAllUsers', {
          method: 'GET',
          headers: {
            'accept': 'text/plain',
          },
        })

        if (!userResponse.ok) {
          throw new Error(`Error fetching users: ${userResponse.statusText}`)
        }

        const claimResponse = await fetch('http://localhost:8000/api/Claims/get-all-claims', {
          method: 'GET',
          headers: {
            'accept': 'text/plain',
          },
        })

        if (!claimResponse.ok) {
          throw new Error(`Error fetching claims: ${claimResponse.statusText}`)
        }

        const usersData = await userResponse.json()
        const claimsData = await claimResponse.json()

        setUsers(usersData)
        setClaims(claimsData)
        setLoading(false)
      } catch (error: unknown) {
        setError(error || "Failed to fetch data")
        setLoading(false)
      }
    }

    fetchUsersAndClaims()
  }, [])

  // Helper function to get the count of active and pending users
  const activeUsers = users.filter((user) => user.status === "active").length
  const totalClaims = claims.length
  const pendingUsers = users.filter((user) => user.status === "pending").length

  // If loading, show loading state
  if (loading) {
    return <div>Loading...</div>
  }

  // If there's an error, show error message
  if (error) {
    return <div>Error: {error as string}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard. Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">{activeUsers} active users</p>
          </CardContent>
        </Card>

        {/* Total Claims Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        {/* Pending Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{user.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims Card */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
            <CardDescription>Latest claim assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{claim.fraudSubtype[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{claim.fraudSubtype}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.userId}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">{claim.claimType}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
