import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '@/components/ui/use-toast'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    toast({
      title: "Authentication required",
      description: "Please log in to access this page",
      variant: "destructive",
    })
    
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute