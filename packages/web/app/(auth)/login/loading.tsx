/**
 * Login loading component
 * Displays skeleton loading state for the login form
 */
export default function LoginLoading() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        {/* Title skeleton */}
        <div className="mx-auto mb-2 h-8 w-3/4 rounded bg-gray-200"></div>
        <div className="mx-auto mb-8 h-4 w-1/2 rounded bg-gray-200"></div>

        {/* Form skeleton */}
        <div className="space-y-4">
          <div>
            <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="h-10 w-full rounded bg-gray-200"></div>
          </div>

          <div>
            <div className="mb-2 h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="h-10 w-full rounded bg-gray-200"></div>
          </div>

          <div className="mt-6 h-10 w-full rounded bg-blue-200"></div>

          <div className="text-center">
            <div className="mx-auto h-4 w-3/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
