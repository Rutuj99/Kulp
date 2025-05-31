import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-9xl font-extrabold text-primary">404</h1>
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="lg">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage