"use client"

import type React from "react"

import { useState, useRef } from "react"
import type { PreferenceCard } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Heart, X } from "lucide-react"

interface MobileSwipeCardProps {
  card: PreferenceCard
  onSwipe: (direction: "left" | "right") => void
}

export function MobileSwipeCard({ card, onSwipe }: MobileSwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      const offset = touch.clientX - rect.left - rect.width / 2
      setDragOffset(offset)
    }
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (Math.abs(dragOffset) > 100) {
      onSwipe(dragOffset > 0 ? "right" : "left")
    }
    setDragOffset(0)
  }

  const swipeLeft = () => onSwipe("left")
  const swipeRight = () => onSwipe("right")

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        ref={cardRef}
        className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform ${
          isDragging ? "scale-105" : ""
        }`}
        style={{
          transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img src={card.image || "/placeholder.svg"} alt={card.title} className="w-full h-64 object-cover" />
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2">{card.title}</h3>
          <p className="text-gray-600 mb-4">{card.description}</p>
          {card.priceRange[0] > 0 && (
            <Badge variant="secondary" className="text-sm">
              ${card.priceRange[0]} - ${card.priceRange[1]}
            </Badge>
          )}
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="flex justify-center gap-8 mt-6">
        <button
          onClick={swipeLeft}
          className="bg-red-500 text-white p-4 rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <X size={24} />
        </button>
        <button
          onClick={swipeRight}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Swipe hint */}
      <p className="text-center text-gray-500 text-sm mt-4">Swipe right to like, left to pass</p>
    </div>
  )
}
