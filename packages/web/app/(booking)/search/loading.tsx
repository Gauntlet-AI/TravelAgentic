/**
 * Search loading component
 * Displays skeleton loading states for flight, hotel, and activity search
 */
export default function SearchLoading() {
  return (
    <div className="space-y-8">
      {/* Search Form Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Search Results Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flights Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-blue-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hotels Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="w-full h-32 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activities Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4">
              <div className="animate-pulse">
                <div className="w-full h-24 bg-gray-200 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 