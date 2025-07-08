"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plane, Clock, Users } from "lucide-react"
import type { Flight } from "@/lib/mock-data"

interface FlightCardProps {
  flight: Flight
  travelers: number
}

export function FlightCard({ flight, travelers }: FlightCardProps) {
  const totalPrice = flight.price * travelers

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{flight.airline}</h3>
              <p className="text-sm text-gray-500">
                {flight.flightNumber} • {flight.aircraft}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${flight.price}</div>
            <div className="text-sm text-gray-500">per person</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-xl font-bold">{flight.departure.time}</div>
            <div className="text-sm text-gray-500">{flight.departure.airport}</div>
            <div className="text-xs text-gray-400">{flight.departure.city}</div>
          </div>

          <div className="flex-1 mx-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="flex-1 h-px bg-gray-300"></div>
              <Plane className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-px bg-gray-300"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              {flight.duration}
            </div>
            <div className="text-xs text-gray-400">
              {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold">{flight.arrival.time}</div>
            <div className="text-sm text-gray-500">{flight.arrival.airport}</div>
            <div className="text-xs text-gray-400">{flight.arrival.city}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{flight.class}</Badge>
            {flight.stops === 0 && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Nonstop
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {travelers} traveler{travelers > 1 ? "s" : ""}
              </div>
              <div className="font-semibold">${totalPrice} total</div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">Select</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
