import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImagePlus, Loader2 } from 'lucide-react'

// Create a single supabase client for interacting with your database
const anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkcHVoeG9vaWNtbHJ3aG9yaHp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODI2OTAsImV4cCI6MjA2NDI1ODY5MH0.ZdhSAQD5LJE7gygk0pZX3HuCm0h_p8Bgjm7L9emBg50"
const supabaseUrl ="https://tdpuhxooicmlrwhorhzt.supabase.co"
const supabase = createClient(supabaseUrl, anon_key)

const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    post: '',
    image: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = async (e) => {
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

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      })
      return
    }
    
    // Create image preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    
    // Upload to Supabase
    try {
      setLoading(true)
      const fileName = `${Date.now()}-${file.name}`
      
      const { data, error } = await supabase.storage
        .from("datasaver")
        .upload(fileName, file)
        
      if (error) {
        throw error
      }
      
      const urlInfo = supabase.storage.from("datasaver").getPublicUrl(data.path)
      
      setFormData(prev => ({
        ...prev,
        image: null,
        imageUrl: urlInfo.data.publicUrl
      }))
      
      toast({
        title: 'Image uploaded',
        description: 'Your image has been uploaded successfully',
      })
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your post',
        variant: 'destructive',
      })
      return
    }

    if (!formData.imageUrl) {
      toast({
        title: 'Image required',
        description: 'Please upload an image for your post',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Send post data with image URL to backend
      const postData = {
        title: formData.title,
        caption: formData.caption,
        post: formData.post,
        imageUrl: formData.imageUrl
      }

      const res = await axios.post('http://localhost:5000/api/posts', postData)

      toast({
        title: 'Success',
        description: 'Your post has been created!',
      })

      // Navigate to the new post
      navigate(`/posts/${res.data.data._id}`)
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create post. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">Share your thoughts and ideas with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Give your post a title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="caption">Caption</Label>
          <Input
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleChange}
            placeholder="Add a short caption"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="post">Content</Label>
          <Textarea
            id="post"
            name="post"
            value={formData.post}
            onChange={handleChange}
            placeholder="Write your post content here..."
            className="min-h-[200px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image <span className="text-destructive">*</span></Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label htmlFor="image" className="cursor-pointer block">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-[300px] mx-auto rounded-md object-contain" 
                  />
                  <div className="mt-2 text-sm text-muted-foreground">Click to change image</div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center">
                  <ImagePlus className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Click to upload an image</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF, WEBP up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Post'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreatePostPage