/**
 * Checkout loading component
 * Displays skeleton loading state for booking summary and payment form
 */
export default function CheckoutLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Booking Summary Skeleton */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            
            {/* Flight Summary */}
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            
            {/* Hotel Summary */}
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            {/* Activities Summary */}
            <div className="pb-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-36"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
            
            {/* Total */}
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="h-3 bg-gray-200 rounded w-12"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center font-bold">
                <div className="h-5 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            
            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
              
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              
              <div className="h-12 bg-blue-200 rounded w-full mt-6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 