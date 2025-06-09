'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { jwtDecode } from "jwt-decode"
import { getCookie } from "@/lib/handle-cookies"
import { apiGet, apiPost } from "@/lib/api"

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  address: string
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    createdAt: '',
    updatedAt: ''
  })

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: ''
  })

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          throw new Error('No authentication token')
        }

        const decodedToken = jwtDecode(token) as { nameid?: string }
        if (!decodedToken.nameid) {
          throw new Error('Invalid token')
        }

        const response = await apiGet(`${apiUrl}/Accounts/get/${decodedToken.nameid}`)
        if (!response) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setProfile(data)
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber || '',
          address: data.address || ''
        })
        setLoading(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch profile')
        setLoading(false)
      }
    }

    fetchProfile()
  }, [apiUrl])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await apiPost(`${apiUrl}/Users/update`, {
        id: profile.id,
        ...formData
      })

      if (!response) {
        throw new Error('Failed to update profile')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsSaving(false)
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </div>
            <Button 
              variant={isEditing ? "outline" : "default"}
              onClick={() => {
                if (isEditing) {
                  setFormData({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phoneNumber: profile.phoneNumber || '',
                    address: profile.address || ''
                  })
                }
                setIsEditing(!isEditing)
              }}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{profile.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm mt-1">{profile.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-sm mt-1">{profile.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-sm mt-1">{profile.phoneNumber || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                />
              ) : (
                <p className="text-sm mt-1">{profile.address || 'Not provided'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Member Since</Label>
              <p className="text-sm mt-1">{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}