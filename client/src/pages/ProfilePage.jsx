import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'
import { Edit, MapPin, Calendar, Loader2 } from 'lucide-react'

const ProfilePage = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  const isOwnProfile = isAuthenticated && (!id || id === user?.id)
  const profileId = isOwnProfile ? user?.id : id

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        // Fetch user profile
        const profileRes = await axios.get(
          isOwnProfile 
            ? 'http://localhost:5000/api/users/me'
            : `http://localhost:5000/api/users/${profileId}`
        )
        setProfile(profileRes.data.data)
        
        // Fetch user posts
        const postsRes = await axios.get(`http://localhost:5000/api/users/${profileId}/posts`)
        setPosts(postsRes.data.data)
      } catch (error) {
        console.error('Error fetching profile data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    if (profileId) {
      fetchProfileData()
    }
  }, [profileId, isOwnProfile, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card rounded-lg shadow-md overflow-hidden border mb-8">
        <div className="bg-primary/10 h-32"></div>
        <div className="p-6 relative">
          <Avatar className="absolute -top-16 left-6 h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={profile.profilePicture} alt={`${profile.firstName} ${profile.lastName}`} />
            <AvatarFallback className="text-2xl">
              {getInitials(`${profile.firstName} ${profile.lastName}`)}
            </AvatarFallback>
          </Avatar>
          
          <div className="ml-28 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
              <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground mt-1">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Joined {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {isOwnProfile && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/edit-profile">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <Link 
                key={post._id} 
                to={`/posts/${post._id}`}
                className="bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.caption}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{formatDate(post.createdAt)}</span>
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            {isOwnProfile ? (
              <div>
                <p className="text-muted-foreground mb-4">Create your first post to share with the community</p>
                <Link to="/create-post">
                  <Button>Create Post</Button>
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground">This user hasn't posted anything yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage