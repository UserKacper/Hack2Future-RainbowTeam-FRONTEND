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
import { getCookie } from "@/lib/handle-cookies"
import { jwtDecode } from "jwt-decode"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

// AI validation thresholds

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

interface AIPrediction {
  tagName: string;
  probability: number;
}

interface AIValidationResult {
  predictions: AIPrediction[];
}

// Helper function to analyze AI validation results
const analyzeAIValidation = (result: AIValidationResult): {
  isPotentialFraud: boolean;
  confidence: number;
  message: string;
} => {
  // Sort predictions by probability
  const predictions = result.predictions.sort((a, b) => b.probability - a.probability)
  
  // Check damage positions
  const notDamagedPrediction = predictions.find(p => p.tagName === 'NOT_demaged')
  const notDamagedConfidence = notDamagedPrediction?.probability || 0
  
  const damagePositions = {
    side: predictions.find(p => p.tagName === 'site')?.probability || 0,
    back: predictions.find(p => p.tagName === 'back')?.probability || 0,
    front: predictions.find(p => p.tagName === 'front')?.probability || 0
  }

  // Calculate total damage confidence (sum of all damage position probabilities)
  const totalDamageConfidence = Object.values(damagePositions).reduce((sum, prob) => sum + prob, 0)

  // If not damaged confidence is high and damage confidence is low, flag as potential fraud
  if (notDamagedConfidence > 0.6 && totalDamageConfidence < 0.3) {
    return {
      isPotentialFraud: true,
      confidence: notDamagedConfidence,
      message: `Potential fraud detected: Image shows no damage (${(notDamagedConfidence * 100).toFixed(1)}% confidence) but damage is claimed. Additional review required.`
    }
  }

  // Check for clear damage at specific positions
  const maxDamageConfidence = Math.max(...Object.values(damagePositions))
  const damageLocations = Object.entries(damagePositions)
    .filter(([, prob]) => prob > 0.4)
    .map(([location]) => location)
    .join(', ')

  if (maxDamageConfidence > 0.7 && notDamagedConfidence < 0.3) {
    return {
      isPotentialFraud: false,
      confidence: maxDamageConfidence,
      message: `Clear damage detected on ${damageLocations} (${(maxDamageConfidence * 100).toFixed(1)}% confidence). Standard verification recommended.`
    }
  }

  // If we have low confidence in all predictions
  if (totalDamageConfidence < 0.4 && notDamagedConfidence < 0.4) {
    return {
      isPotentialFraud: false,
      confidence: Math.max(totalDamageConfidence, notDamagedConfidence),
      message: 'Unable to make confident assessment of damage. Manual review recommended.'
    }
  }

  // If we have conflicting signals (both damage and no damage)
  if (notDamagedConfidence > 0.4 && totalDamageConfidence > 0.4) {
    return {
      isPotentialFraud: true,
      confidence: Math.max(notDamagedConfidence, totalDamageConfidence),
      message: `Inconsistent damage assessment detected. Both damage and no-damage signals are strong. Additional review required.`
    }
  }

  return {
    isPotentialFraud: false,
    confidence: Math.max(totalDamageConfidence, notDamagedConfidence),
    message: `Analysis complete: Damage detected on ${damageLocations || 'unspecified areas'} (${(totalDamageConfidence * 100).toFixed(1)}% total confidence). Standard verification recommended.`
  }
}

export interface Claim {
  id: string
  userId: string
  claimType: string
  isPotentialFraud: boolean
  isConfirmedFraud: boolean
  description: string
  dateOfClaim: string
  claimStatus: string
  fraudSubtype: string
  createdAt: string
  updatedAt: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [isTokenProcessed, setIsTokenProcessed] = useState(false) // Add this state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationProgress, setValidationProgress] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const { toast } = useToast()

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
    imageFile: null as File | null,
  })
  
  const [formErrors, setFormErrors] = useState({
    claimType: '',
    fraudSubtype: '',
    description: '',
    dateOfClaim: '',
    imageUrl: '',
    imageFile: '',
  })

  // Get user role and ID from token
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = getCookie('token')
        console.log('Token present:', !!token)
        
        if (!token) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view your claims.",
            variant: "destructive",
          })
          setError('Please log in to view claims')
          setLoading(false)
          setIsTokenProcessed(true) // Mark token processing as complete
          return
        }

        interface TokenClaims {
          role?: string;
          Role?: string;
          nameid?: string;
          sub?: string;
          userId?: string;
          exp?: number;
        }

        const decodedToken = jwtDecode(token) as TokenClaims
        console.log('Decoded token claims:', decodedToken)
        
        // Check token expiration
        const now = Math.floor(Date.now() / 1000)
        if (decodedToken.exp && decodedToken.exp < now) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          })
          setError('Your session has expired. Please log in again.')
          setLoading(false)
          setIsTokenProcessed(true) // Mark token processing as complete
          return
        }

        // Try different possible user ID claims
        const userIdFromToken = decodedToken.nameid || decodedToken.sub || decodedToken.userId
        
        // Check both lowercase and original case for role
        const tokenRole = (decodedToken.Role || decodedToken.role || '').toLowerCase()
        
        console.log('Token data:', {
          userId: userIdFromToken,
          roleInToken: decodedToken.Role || decodedToken.role,
          normalizedRole: tokenRole
        })

        if (!userIdFromToken) {
          toast({
            title: "Authentication Error",
            description: "Could not find user ID in token. Please log in again.",
            variant: "destructive",
          })
          setError('Could not find user ID in token. Please log in again.')
          setLoading(false)
          setIsTokenProcessed(true) // Mark token processing as complete
          return
        }

        const isUserAdmin = tokenRole === 'admin'
        setIsAdmin(isUserAdmin)
        setUserId(userIdFromToken)
        setError(null)
        setIsTokenProcessed(true) // Mark token processing as complete

      } catch (error) {
        console.error('Token processing error:', error)
        toast({
          title: "Authentication Error",
          description: "There was a problem with your session. Please log in again.",
          variant: "destructive",
        })
        setError('Invalid token format. Please log in again.')
        setLoading(false)
        setIsTokenProcessed(true) // Mark token processing as complete
      }
    }

    loadToken()
  }, [toast])

  // Fetch claims
  useEffect(() => {
    // Don't fetch claims until token is processed
    if (!isTokenProcessed) {
      return;
    }

    const fetchClaims = async () => {
      if (!apiUrl) {
        setError('API URL is not configured')
        setLoading(false)
        return
      }

      // For non-admin users, we need a userId
      if (!isAdmin && !userId) {
        console.error('Missing userId for regular user. isAdmin:', isAdmin, 'userId:', userId)
        setError('Unable to fetch your claims. Please try logging in again.')
        setLoading(false)
        return
      }

      try {
        const endpoint = isAdmin 
          ? `${apiUrl}/Claims/get-all`
          : `${apiUrl}/Claims/get-user-claims/${userId}`
        
        console.log('Fetching claims from:', endpoint)
        const response = await apiGet(endpoint)
        
        if (!response) {
          throw new Error('Failed to fetch claims - no response')
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch claims - ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Claims fetched:', data.length)
        setClaims(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching claims:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch claims')
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchClaims()
  }, [apiUrl, isAdmin, userId, isTokenProcessed]) // Add isTokenProcessed dependency

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, imageFile: 'Please upload an image file (JPG, PNG)' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({ ...prev, imageFile: 'File size must be less than 5MB' }))
        return
      }
      setFormData(prev => ({ ...prev, imageFile: file, imageUrl: '' }))
      setFormErrors(prev => ({ ...prev, imageFile: '', imageUrl: '' }))
    }
  }

  // Form validation
  const validateForm = () => {
    let isValid = true
    const errors = {
      claimType: '',
      fraudSubtype: '',
      description: '',
      dateOfClaim: '',
      imageUrl: '',
      imageFile: ''
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a claim. Please log in and try again.",
        variant: "destructive",
      })
      return false;
    }

    if (!formData.claimType) {
      errors.claimType = 'Claim type is required'
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

    if (!formData.imageUrl && !formData.imageFile) {
      errors.imageUrl = 'Please provide either an image URL or upload a file'
      isValid = false
    }

    if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
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
    setValidationProgress(0)

    try {
      let imageData: Blob | null = null
      setIsValidating(true)
      setValidationProgress(20)

      if (formData.imageFile) {
        imageData = formData.imageFile
        setValidationProgress(40)
      } else if (formData.imageUrl) {
        const imageResponse = await fetch(formData.imageUrl)
        imageData = await imageResponse.blob()
        setValidationProgress(40)
      }

      let aiValidationResult = null

      if (imageData) {
        const url = 'https://hack2future-cv-prediction.cognitiveservices.azure.com/customvision/v3.0/Prediction/397caae1-2d99-453e-87c6-b62b24f22fe1/classify/iterations/Iteration3/image'
        
        try {
          toast({
            title: "Validating Image",
            description: "Please wait while we analyze the image for potential fraud...",
          })

          const aiResponse = await fetch(url, {
            method: 'POST',
            headers: {
              'Prediction-Key': '489842caf1ba49888b250682036be6f7',
              'Content-Type': 'application/octet-stream'
            },
            body: imageData
          })

          if (!aiResponse.ok) {
            throw new Error('AI validation failed')
          }

          const aiResult = await aiResponse.json()
          aiValidationResult = analyzeAIValidation(aiResult)
          setValidationProgress(60)

          toast({
            title: aiValidationResult.isPotentialFraud ? "Potential Fraud Detected" : "Validation Complete",
            description: aiValidationResult.message,
            variant: aiValidationResult.isPotentialFraud ? "destructive" : "default",
          })

        } catch (error) {
          console.error('AI Validation error:', error)
          toast({
            title: "Validation Warning",
            description: "Image validation service is unavailable. Proceeding with manual review.",
            variant: "destructive",
          })
        }
      }

      setValidationProgress(80)
      
      const response = await apiPost(`${apiUrl}/Claims/create?userId=${userId}`, {
        claimType: formData.claimType,
        fraudSubtype: formData.fraudSubtype,
        description: formData.description,
        dateOfClaim: formData.dateOfClaim,
        claimStatus: 'Pending',
        isPotentialFraud: aiValidationResult?.isPotentialFraud || false,
        isConfirmedFraud: false
      })
      
      if (!response) {
        throw new Error('Failed to create claim')
      }

      const newClaim = await response.json()
      
      if (!newClaim.id && !newClaim.Id) {
        throw new Error('Invalid response: No claim ID returned')
      }

      const claimId = newClaim.id || newClaim.Id

      // Handle image upload if we have image data
      if (imageData) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageData)
        
        const uploadResponse = await fetch(`${apiUrl}/Claims/upload-claim-image?claimId=${claimId}`, {
          method: 'POST',
          body: uploadFormData
        })
        
        if (!uploadResponse.ok) {
          // Try to get error message from response
          let errorMessage: string
          try {
            const errorJson = await uploadResponse.json()
            errorMessage = errorJson.message || errorJson.title || errorJson.error || 'Unknown error'
          } catch {
            // If response is not JSON, get text content
            errorMessage = await uploadResponse.text()
          }
          throw new Error(`Failed to upload image: ${errorMessage}`)
        }

        try {
          const { imageUrl } = await uploadResponse.json()
          if (!imageUrl) {
            throw new Error('No image URL returned')
          }
          newClaim.imageUrl = imageUrl
        } catch (error) {
          console.error('Error parsing image upload response:', error)
          throw new Error('Invalid response from image upload')
        }
      }

      setValidationProgress(100)

      setClaims(prevClaims => [...prevClaims, newClaim])
      
      toast({
        title: "Success",
        description: "Claim submitted successfully",
      })

      setFormData({
        claimType: '',
        fraudSubtype: '',
        description: '',
        dateOfClaim: new Date().toISOString(),
        claimStatus: 'Pending',
        isPotentialFraud: false,
        isConfirmedFraud: false,
        imageUrl: '',
        imageFile: null,
      })

      setIsSheetOpen(false)
    } catch (error) {
      console.error('Failed to create claim:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit claim',
        variant: "destructive",
      })
      setFormErrors(prev => ({ 
        ...prev, 
        imageFile: error instanceof Error ? error.message : 'Failed to process image'
      }))
    } finally {
      setIsSubmitting(false)
      setIsValidating(false)
      setValidationProgress(0)
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
          <p className="text-muted-foreground">{isAdmin ? 'Manage all insurance claims' : 'View and manage your claims'}</p>
        </div>
        {!isAdmin && (
          <Sheet 
            open={isSheetOpen} 
            onOpenChange={(open) => {
              if (open && !userId) {
                toast({
                  title: "Not logged in",
                  description: "Please log in to submit a claim",
                  variant: "destructive",
                })
                return;
              }
              setIsSheetOpen(open);
            }}
          >
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Claim
              </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[540px] p-5">
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
                        onValueChange={(value) => setFormData(prev => ({ ...prev, claimType: value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, fraudSubtype: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                        onChange={(e) => setFormData(prev => ({ ...prev, dateOfClaim: new Date(e.target.value).toISOString() }))}
                      />
                      {formErrors.dateOfClaim && <p className="text-sm text-red-500 mt-1">{formErrors.dateOfClaim}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="claimStatus">Status</Label>
                      <Input
                        id="claimStatus"
                        value="Pending"
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Evidence Image *</Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="imageFile">Upload Image</Label>
                        <Input
                          id="imageFile"
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="mt-1"
                        />
                        {formErrors.imageFile && <p className="text-sm text-red-500 mt-1">{formErrors.imageFile}</p>}
                        <p className="text-sm text-muted-foreground mt-1">Accepted formats: JPG, PNG (max 5MB)</p>
                      </div>
                      <div>
                        <Label htmlFor="imageUrl">Or provide image URL</Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          placeholder="https://"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value, imageFile: null }))}
                          className="mt-1"
                          disabled={!!formData.imageFile}
                        />
                        {formErrors.imageUrl && !formData.imageFile && (
                          <p className="text-sm text-red-500 mt-1">{formErrors.imageUrl}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isValidating && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Validation Progress</Label>
                        <span className="text-sm text-muted-foreground">{validationProgress}%</span>
                      </div>
                      <Progress value={validationProgress} max={100} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        {validationProgress < 40 ? "Preparing image..." :
                         validationProgress < 60 ? "Analyzing for potential fraud..." :
                         validationProgress < 80 ? "Processing results..." :
                         validationProgress < 100 ? "Finalizing claim..." :
                         "Validation complete"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-x-2 flex justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsSheetOpen(false)
                      setFormErrors({
                        claimType: '',
                        fraudSubtype: '',
                        description: '',
                        dateOfClaim: '',
                        imageUrl: '',
                        imageFile: '',
                      })
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isValidating}
                  >
                    {isSubmitting || isValidating ? 
                      `${isValidating ? 'Validating...' : 'Creating...'}` : 
                      "Create Claim"}
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {isAdmin && (
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Claims</CardTitle>
          <CardDescription>A list of all {isAdmin ? "" : "your"} insurance claims</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAdmin ? "User" : "Claim ID"}</TableHead>
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
                  <TableCell className="font-medium">{isAdmin ? claim.userId : claim.id}</TableCell>
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
