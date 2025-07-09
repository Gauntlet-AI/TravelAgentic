"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin } from "lucide-react"
import type { Activity } from "@/lib/mock-data"

interface ActivityCardProps {
  activity: Activity
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <img
          src={activity.image || "/placeholder.svg"}
          alt={activity.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{activity.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{activity.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">{activity.description}</p>

          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{activity.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {activity.category.map((cat) => (
              <Badge key={cat} variant="outline" className="text-xs">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">${activity.price}</span>
            <span className="text-gray-500 text-sm">per person</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
