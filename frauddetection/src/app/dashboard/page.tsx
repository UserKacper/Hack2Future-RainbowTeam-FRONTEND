'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Claim } from "./claims/page"
import { User } from "./users/page"
import { apiGet } from "@/lib/api"
import { Users, ShieldCheck, AlertTriangle, UserCheck, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchUsersAndClaims = async () => {
      try {
        const [userResponse, claimResponse] = await Promise.all([
          apiGet(`${apiUrl}/Accounts/get-all`),
          apiGet(`${apiUrl}/Claims/get-all`)
        ])

        if (!userResponse || !claimResponse) {
          throw new Error('Failed to fetch data')
        }

        const usersData = await userResponse.json()
        const claimsData = await claimResponse.json()

        setUsers(usersData)
        setClaims(claimsData)
        setLoading(false)
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to fetch data')
        setLoading(false)
      }
    }

    fetchUsersAndClaims()
  }, [apiUrl])

  // Helper function to get the count of active and pending users
  const activeUsers = users.filter((user) => user.status === "active").length
  const totalClaims = claims.length
  const pendingUsers = users.filter((user) => user.status === "pending").length
  
  // Calculate percentage changes (mock data for demonstration)
  const activeUsersChange = 12.5
  const totalClaimsChange = -8.3
  const pendingUsersChange = 5.2

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Error</CardTitle>
            <CardDescription className="text-red-500">
              {error as string}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your admin dashboard. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">{activeUsers} active users</p>
              </div>
              <div className={`flex items-center text-sm ${activeUsersChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {activeUsersChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(activeUsersChange)}%
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-secondary">
              <div 
                className="h-1 bg-primary" 
                style={{ width: `${(activeUsers / users.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Claims Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold">{totalClaims}</div>
                <p className="text-xs text-muted-foreground">Across all users</p>
              </div>
              <div className={`flex items-center text-sm ${totalClaimsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalClaimsChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(totalClaimsChange)}%
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-xs text-muted-foreground">
                {(totalClaims / users.length).toFixed(1)} claims per user avg.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold">{pendingUsers}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </div>
              <div className={`flex items-center text-sm ${pendingUsersChange >= 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                {pendingUsersChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(pendingUsersChange)}%
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-secondary">
              <div 
                className="h-1 bg-yellow-500" 
                style={{ width: `${(pendingUsers / users.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Users Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </div>
              <UserCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {user.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Claims</CardTitle>
                <CardDescription>Latest claim assignments</CardDescription>
              </div>
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.slice(0, 3).map((claim) => (
                <div key={claim.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-secondary-foreground">{claim.fraudSubtype[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{claim.fraudSubtype}</p>
                    <p className="text-xs text-muted-foreground">
                      {claim.userId}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {claim.claimType}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
