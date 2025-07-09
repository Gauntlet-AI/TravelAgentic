"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import type { Hotel } from "@/lib/mock-data"

interface HotelCardProps {
  hotel: Hotel
  nights: number
}

export function HotelCard({ hotel, nights }: HotelCardProps) {
  const totalPrice = hotel.pricePerNight * nights

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <img
          src={hotel.image || "/placeholder.svg"}
          alt={hotel.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">{hotel.name}</h3>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{hotel.rating}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{hotel.description}</p>
          <p className="text-gray-500 text-sm mb-3">{hotel.location}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {hotel.amenities.map((amenity) => (
              <Badge key={amenity} variant="secondary" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold">${hotel.pricePerNight}</span>
              <span className="text-gray-500 text-sm">/night</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{nights} nights</div>
              <div className="font-semibold">${totalPrice} total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
