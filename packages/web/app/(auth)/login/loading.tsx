/**
 * Login loading component
 * Displays skeleton loading state for the login form
 */
export default function LoginLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
        
        {/* Form skeleton */}
        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          
          <div className="h-10 bg-blue-200 rounded w-full mt-6"></div>
          
          <div className="text-center">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 