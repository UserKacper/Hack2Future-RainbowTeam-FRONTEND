"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontal, Plus, UserIcon, Shield, Calendar, Mail, UserCheck, AlertTriangle, Filter, Users } from "lucide-react"
import { Claim } from "../claims/page"
import { apiGet, apiPost } from "@/lib/api"
import { getCookie } from "@/lib/handle-cookies"
import { jwtDecode } from "jwt-decode"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

export interface User {
  id: string
  firstName: string
  lastName: string
  uniqueIdNumber: string
  email: string
  role: string
  createdAt: string
  lastLogin: string
  status: "active" | "pending" | "inactive"
  insuranceClaimsIds: string[]
}

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState({ users: true, claims: true })
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTokenProcessed, setIsTokenProcessed] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const { toast } = useToast()
    // Check user role first
  useEffect(() => {
    const token = getCookie('token')
    if (!token) {
      setError('Please log in to access this page')
      setIsTokenProcessed(true)
      return
    }

    try {
      const decodedToken = jwtDecode(token) as { 
        Role?: string;
        role?: string;
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
      }
      
      // Try different possible role claim names and normalize to lowercase
      const userRole = (
        decodedToken.Role || 
        decodedToken.role || 
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        ''
      ).toLowerCase()
      
      console.log('Users page - Decoded token:', decodedToken)
      console.log('Users page - User role:', userRole)
      
      if (userRole !== 'admin') {
        console.log('Access denied: User role is not admin')
        setError('You do not have permission to access this page')
        setIsTokenProcessed(true)
        return
      }
      
      setIsAdmin(true)
      setIsTokenProcessed(true)
    } catch (error) {
      console.error('Error processing token:', error)
      setError('Invalid session. Please log in again')
      setIsTokenProcessed(true)
    }
  }, [])

  // Fetch data for users and claims
  useEffect(() => {
    if (!isTokenProcessed || !isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading({ users: true, claims: true })
        
        const [usersResponse, claimsResponse] = await Promise.all([
          apiGet(`${apiUrl}/Accounts/get-all`),
          apiGet(`${apiUrl}/Claims/get-all`)
        ]);

        if (!usersResponse || !claimsResponse) {
          throw new Error('Failed to fetch data')
        }

        const userData = await usersResponse.json();
        const claimsData = await claimsResponse.json();

        setUsers(userData);
        setClaims(claimsData);
        setError(null)
      } catch (error) {
        console.error("Error fetching data:", error);
        setError('Failed to fetch data. Please try again.')
      } finally {
        setLoading({ users: false, claims: false });
      }
    };

    fetchData();
  }, [isTokenProcessed, isAdmin, apiUrl]);

  // Filter the claims based on the selected user's ID
  const userClaims = selectedUser ? claims.filter((claim) => claim.userId === selectedUser.id) : []

  // Calculate user statistics
  const activeUsers = users.filter(u => u.status === 'active').length
  const pendingUsers = users.filter(u => u.status === 'pending').length
  const totalClaims = claims.length
  const avgClaimsPerUser = users.length ? (totalClaims / users.length).toFixed(1) : '0'

  const handleEditUser = async (user: User) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user)
  }

  const handleViewClaims = (user: User) => {
    // Open claims sheet or navigate to claims page
    setSelectedUser(user)
  }

  const handleApproveUser = async (user: User) => {
    if (!apiUrl) return

    try {
      const response = await apiPost(`${apiUrl}/Accounts/approve/${user.id}`, {
        status: 'active'
      })

      if (!response || !response.ok) {
        throw new Error('Failed to approve user')
      }

      // Update local state
      setUsers(users.map(u => 
        u.id === user.id 
          ? { ...u, status: 'active' }
          : u
      ))

      // Update selected user if this was the one being viewed
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: 'active' })
      }

      toast({
        title: "Success",
        description: "User has been approved",
      })
    } catch (error) {
      console.error('Error approving user:', error)
      toast({
        title: "Error",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter functionality
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    const matchesSearch = 
      searchQuery === '' || 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesSearch
  })

  if (!isTokenProcessed) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading.users || loading.claims) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and view their activities</p>
        </div>        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px]"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <div className="mt-2 h-1.5 w-full bg-secondary">
              <div 
                className="h-1.5 bg-green-500" 
                style={{ width: `${(activeUsers / users.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Claims</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgClaimsPerUser}</div>
            <p className="text-xs text-muted-foreground">Claims per user</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                A list of all users in the system. Click on a user to view their details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedUser?.id === user.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          {user.firstName} {user.lastName}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge                          variant={
                            user.status === "active" 
                              ? "default"
                              : user.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle menu actions
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* User Details Panel */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="space-y-4">
              {/* User Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    User Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium">
                        {selectedUser.firstName[0]}
                        {selectedUser.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.role}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />                        <Badge 
                          variant={
                            selectedUser.status === "active" 
                              ? "default"
                              : selectedUser.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {selectedUser.status}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Joined {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {selectedUser.lastLogin && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Last active {new Date(selectedUser.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Claims Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Claims History ({userClaims.length})
                  </CardTitle>
                  <CardDescription>Claims submitted by this user</CardDescription>
                </CardHeader>
                <CardContent>
                  {userClaims.length > 0 ? (
                    <div className="space-y-3">
                      {userClaims.map((claim) => (
                        <div key={claim.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={
                                  claim.isPotentialFraud || claim.isConfirmedFraud
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {claim.claimType}
                              </Badge>
                              <span className="font-mono text-sm font-medium">{claim.fraudSubtype}</span>
                            </div>                            <Badge 
                              variant={claim.claimStatus === "Pending" ? "outline" : "secondary"}
                            >
                              {claim.claimStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{claim.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Filed {new Date(claim.dateOfClaim).toLocaleDateString()}</span>
                            <span>Created {new Date(claim.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No claims found for this user</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => handleEditUser(selectedUser)}>
                  Edit User
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleViewClaims(selectedUser)}>
                  View Claims
                </Button>
                {selectedUser.status === "pending" && (
                  <Button variant="default" className="flex-1" onClick={() => handleApproveUser(selectedUser)}>
                    Approve User
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <UserIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a User</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a user from the table to view their details and claims history
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
