'use client'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { apiGet, apiPost } from "@/lib/api"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

// Helper function to get claim type color
const getTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'auto':
      return 'bg-blue-100 text-blue-800'
    case 'health':
      return 'bg-green-100 text-green-800'
    case 'property':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
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
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Form state
  const [formData, setFormData] = useState({
    claimType: '',
    fraudSubtype: '',
    description: '',
    dateOfClaim: new Date().toISOString(),
    claimStatus: 'Pending',
    isPotentialFraud: false,
    isConfirmedFraud: false,
    imageUrl: '',
  })

  const [formErrors, setFormErrors] = useState({
    claimType: '',
    fraudSubtype: '',
    description: '',
    dateOfClaim: '',
    claimStatus: '',
    imageUrl: '',
  })

  const validateForm = () => {
    let isValid = true
    const errors = {
      claimType: '',
      fraudSubtype: '',
      description: '',
      dateOfClaim: '',
      claimStatus: '',
      imageUrl: '',
    }

    if (!formData.claimType) {
      errors.claimType = 'Claim type is required'
      isValid = false
    }

    if (!formData.fraudSubtype) {
      errors.fraudSubtype = 'Fraud subtype is required'
      isValid = false
    }

    if (!formData.description) {
      errors.description = 'Description is required'
      isValid = false
    }

    if (!formData.dateOfClaim) {
      errors.dateOfClaim = 'Date of claim is required'
      isValid = false
    }

    if (!formData.claimStatus) {
      errors.claimStatus = 'Claim status is required'
      isValid = false
    }

    if (!formData.imageUrl) {
      errors.imageUrl = 'Image URL is required'
      isValid = false
    } else if (!formData.imageUrl.startsWith('http')) {
      errors.imageUrl = 'Please enter a valid URL'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await apiPost(`${apiUrl}/api/Claims/create-insurance-claim`, formData)
      
      if (!response) {
        throw new Error('Failed to create claim')
      }

      const newClaim = await response.json()
      setClaims(prevClaims => [...prevClaims, newClaim])
      
      // Reset form
      setFormData({
        claimType: '',
        fraudSubtype: '',
        description: '',
        dateOfClaim: new Date().toISOString(),
        claimStatus: 'Pending',
        isPotentialFraud: false,
        isConfirmedFraud: false,
        imageUrl: '',
      })
      
      // Close sheet after successful submission
      setIsSheetOpen(false)
    } catch (error) {
      console.error('Failed to create claim:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch claims data when the component mounts
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await apiGet(`${apiUrl}/api/Claims/get-all-claims`)
        
        if (!response) {
          throw new Error('Failed to fetch claims')
        }

        const data = await response.json()
        setClaims(data)  // Assuming the API response is an array of claims
        setLoading(false)
      } catch (error : unknown) {  
        setError(error instanceof Error ? error.message : 'Failed to fetch claims')
        setLoading(false)
      }
    }

    fetchClaims()
  }, [apiUrl])

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
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Claim
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-[540px]">
            <SheetHeader>
              <SheetTitle>Create New Claim</SheetTitle>
              <SheetDescription>
                Fill in the details below to create a new insurance claim.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimType">Claim Type *</Label>
                    <Select 
                      value={formData.claimType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, claimType: value }))
                      }
                    >
                      <SelectTrigger id="claimType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="property">Property</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.claimType && <p className="text-sm text-red-500 mt-1">{formErrors.claimType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fraudSubtype">Fraud Subtype *</Label>
                    <Input 
                      id="fraudSubtype"
                      value={formData.fraudSubtype}
                      onChange={(e) => setFormData(prev => ({ ...prev, fraudSubtype: e.target.value }))
                      }
                    />
                    {formErrors.fraudSubtype && <p className="text-sm text-red-500 mt-1">{formErrors.fraudSubtype}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about the claim"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))
                    }
                    className="min-h-[100px]"
                  />
                  {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfClaim">Date of Claim *</Label>
                    <Input
                      id="dateOfClaim"
                      type="datetime-local"
                      value={formData.dateOfClaim.split('.')[0]}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfClaim: new Date(e.target.value).toISOString() }))
                      }
                    />
                    {formErrors.dateOfClaim && <p className="text-sm text-red-500 mt-1">{formErrors.dateOfClaim}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimStatus">Status *</Label>
                    <Select 
                      value={formData.claimStatus}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, claimStatus: value }))
                      }
                    >
                      <SelectTrigger id="claimStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Review">In Review</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Denied">Denied</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.claimStatus && <p className="text-sm text-red-500 mt-1">{formErrors.claimStatus}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))
                      }
                    />
                    {formErrors.imageUrl && <p className="text-sm text-red-500 mt-1">{formErrors.imageUrl}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-2">
                      <Label>Fraud Status</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isPotentialFraud"
                            checked={formData.isPotentialFraud}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPotentialFraud: e.target.checked }))
                            }
                          />
                          <Label htmlFor="isPotentialFraud">Potential Fraud</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isConfirmedFraud"
                            checked={formData.isConfirmedFraud}
                            onChange={(e) => setFormData(prev => ({ ...prev, isConfirmedFraud: e.target.checked }))
                            }
                          />
                          <Label htmlFor="isConfirmedFraud">Confirmed Fraud</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-x-2 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsSheetOpen(false)
                    setFormErrors({
                      claimType: '',
                      fraudSubtype: '',
                      description: '',
                      dateOfClaim: '',
                      claimStatus: '',
                      imageUrl: '',
                    })
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Claim"}
                  </Button>
                </div>
              </div>
            </form>
          </SheetContent>
        </Sheet>
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
