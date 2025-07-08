"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { ActivityTypeCard } from "@/lib/mock-data"
import { Check } from "lucide-react"

interface ActivityTypeCardProps {
  card: ActivityTypeCard
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function ActivityTypeCardComponent({ card, isSelected, onClick, className }: ActivityTypeCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
      } ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={card.image || "/placeholder.svg"}
            alt={card.title}
            className="w-full h-32 object-cover rounded-t-lg"
          />
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
              <Check size={16} />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{card.icon}</span>
            <h3 className="font-semibold text-lg">{card.title}</h3>
          </div>
          <p className="text-gray-600 text-sm">{card.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
