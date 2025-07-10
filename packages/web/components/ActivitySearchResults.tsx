import { ActivityCard } from './activity-card';

/**
 * Activity result interface for server component data
 */
interface ActivityResult {
  id: string;
  name: string;
  location: string;
  category: string | string[]; // Support both formats
  duration: string;
  rating: number;
  reviewCount?: number;
  price: number;
  currency?: string;
  imageUrl?: string; // Legacy API format
  image?: string; // New AI format
  description?: string;
  source: 'api' | 'browser' | 'voice' | 'manual' | 'ai';
}

/**
 * Props for ActivitySearchResults component
 */
interface ActivitySearchResultsProps {
  activities: ActivityResult[];
}

/**
 * ActivitySearchResults component
 * Displays a list of activity search results
 */
export function ActivitySearchResults({
  activities,
}: ActivitySearchResultsProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <div className="mb-2 text-4xl">🎯</div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No Activities Found
        </h3>
        <p className="text-sm text-gray-600">
          Try exploring different categories or locations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        // Handle both string and array category formats
        const categoryArray = Array.isArray(activity.category) 
          ? activity.category 
          : [activity.category.toLowerCase()];
        
        return (
          <ActivityCard
            key={activity.id}
            activity={{
              id: activity.id,
              name: activity.name,
              description: activity.description || `${Array.isArray(activity.category) ? activity.category.join(', ') : activity.category} • ${activity.duration}`,
              category: categoryArray,
              price: activity.price,
              duration: activity.duration,
              rating: activity.rating,
              image: activity.image || activity.imageUrl || '/placeholder.jpg',
              location: activity.location,
            }}
          />
        );
      })}

      {/* AI indicator */}
      {activities.length > 0 && activities[0]?.source === 'ai' && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-purple-600">
              🤖 Activities curated by AI based on your preferences
            </span>
          </div>
        </div>
      )}

      {/* Fallback indicator */}
      {activities.length > 0 && activities[0]?.source !== 'api' && activities[0]?.source !== 'ai' && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-center">
            <span className="text-sm text-yellow-600">
              ⚠️ Results from{' '}
              {activities[0]?.source === 'manual'
                ? 'manual search'
                : 'fallback system'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
