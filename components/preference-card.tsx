"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PreferenceCard } from "@/lib/mock-data"
import { Check } from "lucide-react"

interface PreferenceCardProps {
  card: PreferenceCard
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

export function PreferenceCardComponent({ card, isSelected, onClick, className }: PreferenceCardProps) {
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
            className="w-full h-48 object-cover rounded-t-lg"
          />
          {isSelected && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
              <Check size={16} />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1">{card.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{card.description}</p>
          {card.priceRange[0] > 0 && (
            <Badge variant="secondary">
              ${card.priceRange[0]} - ${card.priceRange[1]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
