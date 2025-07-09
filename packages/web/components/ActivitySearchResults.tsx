import { ActivityCard } from './activity-card'

/**
 * Activity result interface for server component data
 */
interface ActivityResult {
  id: string
  name: string
  location: string
  category: string
  duration: string
  rating: number
  reviewCount: number
  price: number
  currency: string
  imageUrl: string
  source: 'api' | 'browser' | 'voice' | 'manual'
}

/**
 * Props for ActivitySearchResults component
 */
interface ActivitySearchResultsProps {
  activities: ActivityResult[]
}

/**
 * ActivitySearchResults component
 * Displays a list of activity search results
 */
export function ActivitySearchResults({ activities }: ActivitySearchResultsProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-4xl mb-2">🎯</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
        <p className="text-gray-600 text-sm">
          Try exploring different categories or locations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={{
            id: activity.id,
            name: activity.name,
            description: `${activity.category} • ${activity.duration}`,
            category: [activity.category.toLowerCase()],
            price: activity.price,
            duration: activity.duration,
            rating: activity.rating,
            image: activity.imageUrl,
            location: activity.location
          }}
        />
      ))}
      
      {/* Fallback indicator */}
      {activities.length > 0 && activities[0]?.source !== 'api' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <span className="text-yellow-600 text-sm">
              ⚠️ Results from {activities[0]?.source === 'manual' ? 'manual search' : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 