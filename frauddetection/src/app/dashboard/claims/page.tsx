'use client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus } from "lucide-react"
import { useEffect, useState } from "react"

// Helper function to format dates
const formatDate = (date: string) => new Date(date).toLocaleDateString()

// Helper function to get fraud status badge
const getFraudBadge = (isPotentialFraud: boolean, isConfirmedFraud: boolean) => {
  if (isConfirmedFraud) {
    return <Badge className="bg-red-100 text-red-800">Confirmed Fraud</Badge>
  }
  if (isPotentialFraud) {
    return <Badge className="bg-yellow-100 text-yellow-800">Potential Fraud</Badge>
  }
  return <Badge className="bg-green-100 text-green-800">Valid</Badge>
}

export interface Claim {
  fraudSubtype: string
  id: string
  userId: string
  claimType: string
  isPotentialFraud: boolean
  isConfirmedFraud: boolean
  description: string
  dateOfClaim: string
  claimStatus: string
  createdAt: string
  updatedAt: string
}


export default function ClaimsPage() {
  // State to store fetched claims
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch claims data when the component mounts
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/Claims/get-all-claims`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
           },
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const data = await response.json()
        setClaims(data)  // Assuming the API response is an array of claims
        setLoading(false)
      } catch (error : unknown) {  
        setError(error || "Failed to fetch claims")
        setLoading(false)
      }
    }

    fetchClaims()
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "role":
        return "bg-blue-100 text-blue-800"
      case "permission":
        return "bg-green-100 text-green-800"
      case "feature":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error as string}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Insurance Claims</h2>
          <p className="text-muted-foreground">Manage insurance claims, fraud statuses, and more</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Claim
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Fraud Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.filter((c) => c.isConfirmedFraud).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Potential Fraud Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.filter((c) => c.isPotentialFraud).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valid Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{claims.filter((c) => !c.isPotentialFraud && !c.isConfirmedFraud).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
          <CardDescription>A list of all insurance claims in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Claim Type</TableHead>
                <TableHead>Fraud Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date of Claim</TableHead>
                <TableHead>Claim Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.userId || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(claim.claimType)}>{claim.claimType}</Badge>
                  </TableCell>
                  <TableCell>{getFraudBadge(claim.isPotentialFraud, claim.isConfirmedFraud)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{claim.description || "No description"}</TableCell>
                  <TableCell>{formatDate(claim.dateOfClaim)}</TableCell>
                  <TableCell>{claim.claimStatus || "N/A"}</TableCell>
                  <TableCell>{formatDate(claim.createdAt)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
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
  )
}
