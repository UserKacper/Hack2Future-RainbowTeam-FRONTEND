"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontal, Plus, UserIcon, Shield, Calendar, Mail, UserCheck } from "lucide-react"
import { Claim } from "../claims/page"
import { apiGet } from "@/lib/api"

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  // Fetch data for users and claims
  const fetchData = async () => {
    try {
      const [usersResponse, claimsResponse] = await Promise.all([
        apiGet(`${apiUrl}/api/Accounts/GetAllUsers`),
        apiGet(`${apiUrl}/api/Claims/get-all-claims`)
      ]);

      if (usersResponse) {
        const userData = await usersResponse.json();
        setUsers(userData);
      }

      if (claimsResponse) {
        const claimsData = await claimsResponse.json();
        setClaims(claimsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading({ users: false, claims: false });
    }
  };
  useEffect(() => {
    void fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "auto":
        return "bg-blue-100 text-blue-800"
      case "health":
        return "bg-green-100 text-green-800"
      case "property":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filter the claims based on the selected user's ID
  const userClaims = selectedUser ? claims.filter((claim) => claim.userId === selectedUser.id) : []

  if (loading.users || loading.claims) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Click on a user to view details and claims</CardDescription>
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
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className={`cursor-pointer hover:bg-muted/50 ${selectedUser?.id === user.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
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
                      <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Joined {selectedUser.createdAt}</span>
                    </div>

                    {selectedUser.lastLogin && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Last login {selectedUser.lastLogin}</span>
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
                    User Claims ({userClaims.length})
                  </CardTitle>
                  <CardDescription>Claims associated with this user</CardDescription>
                </CardHeader>
                <CardContent>
                  {userClaims.length > 0 ? (
                    <div className="space-y-3">
                      {userClaims.map((claim) => (
                        <div key={claim.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(claim.claimType)}>{claim.claimType}</Badge>
                              <span className="font-mono text-sm font-medium">{claim.fraudSubtype}</span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{claim.claimStatus}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{claim.description}</p>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Claimed on {claim.dateOfClaim}</span>
                            <span>Created on {claim.createdAt}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Shield className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No claims assigned to this user</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Edit User
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Manage Claims
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <UserIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Select a User</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on a user from the table to view their details and claims
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
