import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Loader2, ImagePlus } from 'lucide-react'

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    location: '',
    password: '',
    confirmPassword: '',
    profilePicture: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        location: user.location || '',
        password: '',
        confirmPassword: '',
        profilePicture: null
      })
      setImagePreview(user.profilePicture || null)
      setInitialLoading(false)
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)',
        variant: 'destructive',
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile picture must be less than 2MB',
        variant: 'destructive',
      })
      return
    }

    setFormData(prev => ({
      ...prev,
      profilePicture: file
    }))

    // Create image preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: 'Missing information',
        description: 'First name and last name are required',
        variant: 'destructive',
      })
      return
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please provide a valid email address',
        variant: 'destructive',
      })
      return
    }

    // Check if password fields match if either is filled
    if ((formData.password || formData.confirmPassword) && 
        formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Create FormData object for file upload
      const profileData = new FormData()
      profileData.append('firstName', formData.firstName)
      profileData.append('lastName', formData.lastName)
      profileData.append('email', formData.email)
      profileData.append('location', formData.location)
      
      // Only append password if it's provided
      if (formData.password) {
        profileData.append('password', formData.password)
      }
      
      // Only append profile picture if it's provided
      if (formData.profilePicture) {
        profileData.append('profilePicture', formData.profilePicture)
      }

      await updateProfile(profileData)

      toast({
        title: 'Success',
        description: 'Your profile has been updated!',
      })

      // Navigate to profile page
      navigate('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-muted group-hover:opacity-75 transition-opacity">
              <AvatarImage src={imagePreview} alt={`${formData.firstName} ${formData.lastName}`} />
              <AvatarFallback className="text-2xl">
                {getInitials(`${formData.firstName} ${formData.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label htmlFor="profilePicture" className="cursor-pointer">
                <div className="rounded-full bg-primary/80 p-2">
                  <ImagePlus className="h-5 w-5 text-white" />
                </div>
              </label>
            </div>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <label htmlFor="profilePicture" className="mt-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Change profile picture
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City, Country"
          />
        </div>

        <div className="pt-4 border-t">
          <h2 className="text-lg font-medium mb-4">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-4">Leave blank if you don't want to change your password</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/profile')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditProfilePage