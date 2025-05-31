import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUp, ArrowDown, Calendar, User, Edit, Trash2 } from 'lucide-react'

const PostDetailPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`)
        setPost(res.data.data)
      } catch (error) {
        console.error('Error fetching post:', error)
        toast({
          title: 'Error',
          description: 'Failed to load post. It may have been deleted or does not exist.',
          variant: 'destructive',
        })
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, navigate, toast])

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to vote on posts',
        variant: 'destructive',
      })
      return
    }

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${id}/vote`, {
        type: voteType
      })
      setPost(res.data.data)
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: 'Error',
        description: 'Failed to register your vote. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to comment on posts',
        variant: 'destructive',
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${id}/comment`, {
        comment
      })
      setPost({ ...post, comments: res.data.data })
      setComment('')
      toast({
        title: 'Success',
        description: 'Your comment has been added',
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add your comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      await axios.delete(`http://localhost:5000/api/posts/${id}`)
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      })
      navigate('/')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete post. Please try again.',
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

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Post not found</h2>
        <p className="text-muted-foreground mb-6">The post you're looking for doesn't exist or has been removed.</p>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const isAuthor = isAuthenticated && user?.id === post.userId

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">
          &larr; Back to Home
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-md overflow-hidden border">
        {/* Post Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            
            {isAuthor && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/edit-post/${post._id}`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDeletePost}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            <span className="mr-4">{post.firstName} {post.lastName}</span>
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {/* Post Image */}
        <div className="relative">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto max-h-[500px] object-contain bg-accent/20"
          />
          
          {/* Voting */}
          <div className="absolute left-4 top-4 flex flex-col items-center space-y-1 rounded-md bg-background/90 p-2 shadow-md">
            <button
              onClick={() => handleVote('upvote')}
              className="rounded-md p-1 hover:bg-accent"
              aria-label="Upvote"
            >
              <ArrowUp className="h-6 w-6 text-muted-foreground" />
            </button>
            <span className="text-lg font-medium">{post.voteCount || 0}</span>
            <button
              onClick={() => handleVote('downvote')}
              className="rounded-md p-1 hover:bg-accent"
              aria-label="Downvote"
            >
              <ArrowDown className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-muted-foreground mb-4">{post.caption}</p>
            <div className="prose max-w-none">
              {post.post}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Comments ({post.comments?.length || 0})</h2>
            
            {/* Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <div className="flex space-x-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-muted/50 rounded-md p-4 mb-6 text-center">
                <p className="text-muted-foreground mb-2">You need to be logged in to comment</p>
                <Link to="/login">
                  <Button variant="outline" size="sm">Log in</Button>
                </Link>
              </div>
            )}

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment, index) => (
                  <div key={index} className="bg-muted/30 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{comment.firstName} {comment.lastName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <p className="mt-2">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetailPage