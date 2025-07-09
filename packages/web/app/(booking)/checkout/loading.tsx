/**
 * Checkout loading component
 * Displays skeleton loading state for booking summary and payment form
 */
export default function CheckoutLoading() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Booking Summary Skeleton */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-1/3 rounded bg-gray-200"></div>

            {/* Flight Summary */}
            <div className="mb-4 border-b pb-4">
              <div className="mb-3 flex items-center space-x-2">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200"></div>
                  <div className="h-3 w-24 rounded bg-gray-200"></div>
                </div>
                <div className="h-5 w-20 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Hotel Summary */}
            <div className="mb-4 border-b pb-4">
              <div className="mb-3 flex items-center space-x-2">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="h-4 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200"></div>
                  <div className="h-3 w-28 rounded bg-gray-200"></div>
                </div>
                <div className="h-5 w-24 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Activities Summary */}
            <div className="pb-4">
              <div className="mb-3 flex items-center space-x-2">
                <div className="h-5 w-5 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="h-3 w-36 rounded bg-gray-200"></div>
                      <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Skeleton */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 rounded-lg bg-white p-6 shadow">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-1/2 rounded bg-gray-200"></div>

            {/* Total */}
            <div className="mb-6 border-b border-t py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="h-4 w-16 rounded bg-gray-200"></div>
                <div className="h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div className="mb-2 flex items-center justify-between">
                <div className="h-3 w-12 rounded bg-gray-200"></div>
                <div className="h-3 w-16 rounded bg-gray-200"></div>
              </div>
              <div className="flex items-center justify-between font-bold">
                <div className="h-5 w-16 rounded bg-gray-200"></div>
                <div className="h-5 w-24 rounded bg-gray-200"></div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
                <div className="h-10 w-full rounded bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-10 w-full rounded bg-gray-200"></div>
                </div>
                <div>
                  <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
                  <div className="h-10 w-full rounded bg-gray-200"></div>
                </div>
              </div>

              <div>
                <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
                <div className="h-10 w-full rounded bg-gray-200"></div>
              </div>

              <div className="mt-6 h-12 w-full rounded bg-blue-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
