/**
 * Search loading component
 * Displays skeleton loading states for flight, hotel, and activity search
 */
export default function SearchLoading() {
  return (
    <div className="space-y-8">
      {/* Search Form Skeleton */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
            <div className="h-10 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      {/* Search Results Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Flights Skeleton */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center space-x-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow">
              <div className="animate-pulse">
                <div className="mb-3 flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="h-3 w-16 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-3 w-32 rounded bg-gray-200"></div>
                  <div className="h-8 w-20 rounded bg-blue-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hotels Skeleton */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center space-x-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow">
              <div className="animate-pulse">
                <div className="mb-3 h-32 w-full rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-gray-200"></div>
                    <div className="h-6 w-20 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activities Skeleton */}
        <div className="space-y-4">
          <div className="mb-4 flex items-center space-x-2">
            <div className="h-6 w-6 animate-pulse rounded bg-gray-200"></div>
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>

          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow">
              <div className="animate-pulse">
                <div className="mb-3 h-24 w-full rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-4 w-5/6 rounded bg-gray-200"></div>
                  <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="h-3 w-12 rounded bg-gray-200"></div>
                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
