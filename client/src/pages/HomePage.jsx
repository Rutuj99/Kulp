import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { formatDate, truncateText } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowUp, ArrowDown, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'

const HomePage = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/posts')
        setPosts(res.data.data)
      } catch (error) {
        console.error('Error fetching posts:', error)
        toast({
          title: 'Error',
          description: 'Failed to load posts. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleVote = async (postId, voteType) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote on posts',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/vote`, {
        type: voteType
      })
      
      // Update posts state with the updated post
      setPosts(posts.map(post => 
        post._id === postId ? res.data.data : post
      ))
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Error',
        description: 'Failed to register your vote. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Discover Products</h1>
        {isAuthenticated && (
          <Link to="/create-post">
            <Button>Create Post</Button>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No posts yet</h2>
          <p className="text-muted-foreground mb-6">Be the first to share a product!</p>
          {isAuthenticated ? (
            <Link to="/create-post">
              <Button>Create Post</Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button>Log in to Post</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post._id} className="group relative overflow-hidden rounded-lg border bg-background p-2">
              <div className="flex flex-col space-y-2">
                {/* Voting */}
                <div className="absolute left-2 top-2 flex flex-col items-center space-y-1 rounded-md bg-background/90 p-1 shadow-sm">
                  <button
                    onClick={() => handleVote(post._id, 'upvote')}
                    className="rounded-md p-1 hover:bg-accent"
                    aria-label="Upvote"
                  >
                    <ArrowUp className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <span className="text-sm font-medium">{post.voteCount || 0}</span>
                  <button
                    onClick={() => handleVote(post._id, 'downvote')}
                    className="rounded-md p-1 hover:bg-accent"
                    aria-label="Downvote"
                  >
                    <ArrowDown className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Image */}
                <Link to={`/post/${post._id}`} className="overflow-hidden rounded-md">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="h-[200px] w-full object-cover transition-transform group-hover:scale-105"
                  />
                </Link>

                {/* Content */}
                <div className="flex-1 space-y-2 p-2">
                  <Link to={`/post/${post._id}`}>
                    <h3 className="font-semibold leading-none tracking-tight hover:underline">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {truncateText(post.caption, 100)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-1">
                    <Link to={`/post/${post._id}`} className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments?.length || 0}</span>
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Posted by {post.firstName} {post.lastName} on {formatDate(post.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage