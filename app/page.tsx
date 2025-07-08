"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatInterface } from "@/components/chat-interface"
import { ActivityTypeCardComponent } from "@/components/activity-type-card"
import { HotelCard } from "@/components/hotel-card"
import { ActivityCard } from "@/components/activity-card"
import { TravelInputForm } from "@/components/travel-input-form"
import { activityTypes, type TravelDetails, type Hotel, type Activity, type Flight, mockFlights } from "@/lib/mock-data"
import { searchHotels, researchActivities, filterActivitiesByTypes } from "@/lib/api"
import { format, differenceInDays } from "date-fns"
import { Loader2, RotateCcw, Sparkles, PartyPopper, Heart, Star } from "lucide-react"
import { FlightCard } from "@/components/flight-card"

export default function VacationPlanner() {
  const [isMobile, setIsMobile] = useState(false)
  const [showTravelForm, setShowTravelForm] = useState(true)
  const [travelDetails, setTravelDetails] = useState<TravelDetails | null>(null)
  const [selectedActivityTypes, setSelectedActivityTypes] = useState<string[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [allActivities, setAllActivities] = useState<Activity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([])
  const [isLoadingHotels, setIsLoadingHotels] = useState(false)
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [isChatCollapsed, setIsChatCollapsed] = useState(true)
  const [activityResearch, setActivityResearch] = useState<string>("")

  // Add new state variables for loading states
  const [isLoadingFlights, setIsLoadingFlights] = useState(false)
  const [flights, setFlights] = useState<Flight[]>([])
  const [flightThoughts, setFlightThoughts] = useState<string[]>([])
  const [hotelThoughts, setHotelThoughts] = useState<string[]>([])
  const [activityThoughts, setActivityThoughts] = useState<string[]>([])
  const [allAgentsComplete, setAllAgentsComplete] = useState(false)
  const [showCelebrationModal, setShowCelebrationModal] = useState(false)
  const [hasShownCelebration, setHasShownCelebration] = useState(false)
  const celebrationProcessingRef = useRef(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (allActivities.length > 0) {
      const filtered = filterActivitiesByTypes(allActivities, selectedActivityTypes)
      setFilteredActivities(filtered)
    }
  }, [allActivities, selectedActivityTypes])

  const handleTravelDetailsSubmit = async (details: TravelDetails) => {
    setTravelDetails(details)
    setShowTravelForm(false)

    // Calculate nights first
    const nights = details.startDate && details.endDate ? differenceInDays(details.endDate, details.startDate) : 0

    // Start all loading states
    setIsLoadingHotels(true)
    setIsLoadingActivities(true)
    setIsLoadingFlights(true)

    // Generate personalized thinking messages with correct data
    const travelerText = `${details.adults} adult${details.adults !== 1 ? "s" : ""}${
      details.children > 0 ? ` and ${details.children} child${details.children !== 1 ? "ren" : ""}` : ""
    }`
    const petText = details.travelingWithPets ? " that allows pets" : ""

    // Extract city names from location strings for cleaner display
    const getLocationName = (location: string) => {
      // Extract just the city and country part before the airport code
      const match = location.match(/^([^(]+)/)
      return match ? match[1].trim() : location
    }

    const departureCity = getLocationName(details.departureLocation)
    const destinationCity = getLocationName(details.destination)

    // Flight thinking simulation
    const flightThinkingSteps = [
      `Searching for flights from ${departureCity} to ${destinationCity}...`,
      `Analyzing departure times for ${travelerText}...`,
      `Comparing prices across multiple airlines...`,
      `Checking seat availability for ${details.travelers} passengers...`,
      `Finding the best flight options for your travel dates...`,
      `Finalizing flight recommendations...`,
    ]

    // Hotel thinking simulation
    const hotelThinkingSteps = [
      `Searching for hotels in ${destinationCity}${petText}...`,
      `Looking for accommodations for ${travelerText}...`,
      `Checking availability for ${nights} night${nights !== 1 ? "s" : ""}...`,
      `Comparing amenities and guest reviews...`,
      `Filtering hotels based on your preferences...`,
      `Selecting the best hotel options...`,
    ]

    // Activity thinking simulation
    const activityThinkingSteps = [
      `Researching activities in ${destinationCity}...`,
      `Finding family-friendly options for ${travelerText}...`,
      `Discovering local attractions and experiences...`,
      `Checking activity availability for your dates...`,
      `Curating personalized recommendations...`,
      `Finalizing activity suggestions...`,
    ]

    // Simulate thinking process for flights
    let flightStep = 0
    const flightThinkingInterval = setInterval(() => {
      if (flightStep < flightThinkingSteps.length) {
        setFlightThoughts((prev) => [...prev, flightThinkingSteps[flightStep]])
        flightStep++
      } else {
        clearInterval(flightThinkingInterval)
      }
    }, 1500)

    // Simulate thinking process for hotels
    let hotelStep = 0
    const hotelThinkingInterval = setInterval(() => {
      if (hotelStep < hotelThinkingSteps.length) {
        setHotelThoughts((prev) => [...prev, hotelThinkingSteps[hotelStep]])
        hotelStep++
      } else {
        clearInterval(hotelThinkingInterval)
      }
    }, 1600)

    // Simulate thinking process for activities
    let activityStep = 0
    const activityThinkingInterval = setInterval(() => {
      if (activityStep < activityThinkingSteps.length) {
        setActivityThoughts((prev) => [...prev, activityThinkingSteps[activityStep]])
        activityStep++
      } else {
        clearInterval(activityThinkingInterval)
      }
    }, 1400)

    // Load flights after 10 seconds
    setTimeout(() => {
      setFlights(mockFlights)
      setIsLoadingFlights(false)
      clearInterval(flightThinkingInterval)
      checkAllAgentsComplete()
    }, 10000)

    // Load hotels after 10 seconds
    setTimeout(() => {
      searchHotels(details)
        .then(setHotels)
        .catch(console.error)
        .finally(() => {
          setIsLoadingHotels(false)
          clearInterval(hotelThinkingInterval)
          checkAllAgentsComplete()
        })
    }, 10000)

    // Load activities after 10 seconds
    setTimeout(() => {
      researchActivities(details)
        .then(setAllActivities)
        .catch(console.error)
        .finally(() => {
          setIsLoadingActivities(false)
          clearInterval(activityThinkingInterval)
          checkAllAgentsComplete()
        })
    }, 10000)

    // Also trigger LLM research
    if (details.startDate && details.endDate) {
      fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: details.destination,
          startDate: format(details.startDate, "yyyy-MM-dd"),
          endDate: format(details.endDate, "yyyy-MM-dd"),
          travelers: details.travelers,
        }),
      })
        .then((res) => res.json())
        .then((data) => setActivityResearch(data.research))
        .catch(console.error)
    }
  }

  const handleActivityTypeSelect = (typeId: string) => {
    setSelectedActivityTypes((prev) => (prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]))
  }

  const triggerConfetti = () => {
    // Create confetti elements
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
    const confettiCount = 50

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div")
      confetti.style.position = "fixed"
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.top = "-10px"
      confetti.style.width = "10px"
      confetti.style.height = "10px"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.borderRadius = "50%"
      confetti.style.pointerEvents = "none"
      confetti.style.zIndex = "9999"
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`

      document.body.appendChild(confetti)

      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti)
        }
      }, 5000)
    }
  }

  // Add CSS animation for confetti
  useEffect(() => {
    const style = document.createElement("style")
    style.textContent = `
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])

  const checkAllAgentsComplete = () => {
    // Use setTimeout to ensure state updates have been processed
    setTimeout(() => {
      if (!isLoadingFlights && !isLoadingHotels && !isLoadingActivities) {
        // Check if we're already processing the celebration
        if (!celebrationProcessingRef.current) {
          celebrationProcessingRef.current = true
          setAllAgentsComplete(true)
          
          // Only show celebration if not already shown
          if (!hasShownCelebration) {
            setShowCelebrationModal(true)
            setHasShownCelebration(true)
            triggerConfetti()
          }
        }
      }
    }, 100)
  }

  const resetAll = () => {
    setShowTravelForm(true)
    setTravelDetails(null)
    setSelectedActivityTypes([])
    setHotels([])
    setAllActivities([])
    setFilteredActivities([])
    setActivityResearch("")
    setFlights([])
    setFlightThoughts([])
    setHotelThoughts([])
    setActivityThoughts([])
    setAllAgentsComplete(false)
    setShowCelebrationModal(false)
    setHasShownCelebration(false)
    celebrationProcessingRef.current = false
  }

  const nights =
    travelDetails?.startDate && travelDetails?.endDate
      ? differenceInDays(travelDetails.endDate, travelDetails.startDate)
      : 0

  if (showTravelForm) {
    return <TravelInputForm onSubmit={handleTravelDetailsSubmit} isMobile={isMobile} />
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Chat Interface */}
        <ChatInterface
          className={`fixed top-0 left-0 right-0 z-50 transition-transform ${
            isChatCollapsed ? "transform -translate-y-full" : ""
          }`}
          isMobile={true}
          isCollapsed={isChatCollapsed}
          onToggle={() => setIsChatCollapsed(!isChatCollapsed)}
        />

        {/* Mobile Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">Vacation Planner</h1>
            <Button variant="outline" size="sm" onClick={resetAll}>
              <RotateCcw size={16} />
            </Button>
          </div>
          {travelDetails && (
            <div className="text-sm text-gray-600 mb-2">
              {travelDetails.departureLocation} → {travelDetails.destination}
              {travelDetails.startDate && travelDetails.endDate && (
                <div>
                  {format(travelDetails.startDate, "MMM d")} - {format(travelDetails.endDate, "MMM d")} ({nights}{" "}
                  nights) • {travelDetails.adults} adult{travelDetails.adults !== 1 ? "s" : ""}
                  {travelDetails.children > 0
                    ? `, ${travelDetails.children} child${travelDetails.children !== 1 ? "ren" : ""}`
                    : ""}
                  {travelDetails.travelingWithPets ? " • with pets" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activities">Activity Types</TabsTrigger>
              <TabsTrigger value="flights" className="flex items-center gap-1">
                <span className="hidden sm:inline">Flights</span>
                <span className="sm:hidden">✈️</span>
                {isLoadingFlights && <Sparkles className="w-3 h-3 animate-pulse text-blue-500" />}
              </TabsTrigger>
              <TabsTrigger value="hotels" className="flex items-center gap-1">
                <span className="hidden sm:inline">Hotels</span>
                <span className="sm:hidden">🏨</span>
                {isLoadingHotels && <Sparkles className="w-3 h-3 animate-pulse text-blue-500" />}
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-1">
                <span className="hidden sm:inline">Results</span>
                <span className="sm:hidden">📍</span>
                {isLoadingActivities && <Sparkles className="w-3 h-3 animate-pulse text-blue-500" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>What interests you?</CardTitle>
                  <p className="text-sm text-gray-600">Select activity types to filter recommendations</p>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                {activityTypes.map((type) => (
                  <ActivityTypeCardComponent
                    key={type.id}
                    card={type}
                    isSelected={selectedActivityTypes.includes(type.id)}
                    onClick={() => handleActivityTypeSelect(type.id)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="flights" className="space-y-4">
              {isLoadingFlights ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                      AI Flight Agent
                    </CardTitle>
                    <p className="text-sm text-gray-600">Searching for flights...</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {flightThoughts.map((thought, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p>{thought}</p>
                        </div>
                      ))}
                      {flightThoughts.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          <span>Initializing...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} travelers={travelDetails?.travelers || 1} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="hotels" className="space-y-4">
              {isLoadingHotels ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                      AI Hotel Agent
                    </CardTitle>
                    <p className="text-sm text-gray-600">Searching for hotels...</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {hotelThoughts.map((thought, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p>{thought}</p>
                        </div>
                      ))}
                      {hotelThoughts.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          <span>Initializing...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              {isLoadingActivities ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                      AI Activity Agent
                    </CardTitle>
                    <p className="text-sm text-gray-600">Researching activities...</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activityThoughts.map((thought, index) => (
                        <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p>{thought}</p>
                        </div>
                      ))}
                      {activityThoughts.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                          <span>Initializing...</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {selectedActivityTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedActivityTypes.map((typeId) => {
                        const type = activityTypes.find((t) => t.id === typeId)
                        return (
                          <Badge key={typeId} variant="secondary">
                            {type?.icon} {type?.title}
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  {filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}

                  {filteredActivities.length === 0 && allActivities.length > 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No activities match your selected types. Try selecting different activity types.
                    </p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">TravelAgentic</h1>
            <Button variant="outline" onClick={resetAll}>
              <RotateCcw size={16} className="mr-2" />
              Start Over
            </Button>
          </div>
          {travelDetails && (
            <div className="text-gray-600 text-center mb-4">
              <div className="font-medium text-lg">
                {travelDetails.departureLocation} → {travelDetails.destination}
              </div>
              {travelDetails.startDate && travelDetails.endDate && (
                <div className="text-sm mt-1">
                  {format(travelDetails.startDate, "MMM d")} - {format(travelDetails.endDate, "MMM d")} ({nights}{" "}
                  {nights === 1 ? "night" : "nights"}) • {travelDetails.adults} adult
                  {travelDetails.adults !== 1 ? "s" : ""}
                  {travelDetails.children > 0
                    ? `, ${travelDetails.children} child${travelDetails.children !== 1 ? "ren" : ""}`
                    : ""}
                  {travelDetails.travelingWithPets ? " • with pets" : ""}
                </div>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="activities" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="activities">Activity Preferences</TabsTrigger>
            <TabsTrigger value="flights" className="flex items-center gap-2">
              Flights
              {isLoadingFlights && <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />}
            </TabsTrigger>
            <TabsTrigger value="hotels" className="flex items-center gap-2">
              Hotels
              {isLoadingHotels && <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              Activity Results
              {isLoadingActivities && <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What type of activities interest you?</CardTitle>
                <p className="text-gray-600">
                  Select the types of activities you'd like to do. This will help us filter the research results.
                </p>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {activityTypes.map((type) => (
                <ActivityTypeCardComponent
                  key={type.id}
                  card={type}
                  isSelected={selectedActivityTypes.includes(type.id)}
                  onClick={() => handleActivityTypeSelect(type.id)}
                />
              ))}
            </div>

            {selectedActivityTypes.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Selected Activity Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivityTypes.map((typeId) => {
                      const type = activityTypes.find((t) => t.id === typeId)
                      return (
                        <Badge key={typeId} variant="secondary" className="text-sm">
                          {type?.icon} {type?.title}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="flights">
            {isLoadingFlights ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                    AI Flight Agent is searching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {flightThoughts.map((thought, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {flightThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mr-2" />
                        <span>Initializing flight search...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Flight Options</CardTitle>
                    <p className="text-gray-600">
                      Best flights for your trip from {travelDetails?.departureLocation} to {travelDetails?.destination}
                    </p>
                  </CardHeader>
                </Card>
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <FlightCard key={flight.id} flight={flight} travelers={travelDetails?.travelers || 1} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hotels">
            {isLoadingHotels ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                    AI Hotel Agent is searching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hotelThoughts.map((thought, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {hotelThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mr-2" />
                        <span>Initializing hotel search...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="results">
            {isLoadingActivities ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-pulse text-blue-500" />
                    AI Activity Agent is researching...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activityThoughts.map((thought, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>{thought}</p>
                      </div>
                    ))}
                    {activityThoughts.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mr-2" />
                        <span>Initializing activity research...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div>
                {selectedActivityTypes.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Filtered by your preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivityTypes.map((typeId) => {
                          const type = activityTypes.find((t) => t.id === typeId)
                          return (
                            <Badge key={typeId} variant="secondary">
                              {type?.icon} {type?.title}
                            </Badge>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredActivities.map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))}
                </div>

                {filteredActivities.length === 0 && allActivities.length > 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <p className="text-gray-500 mb-4">No activities match your selected preferences.</p>
                      <p className="text-sm text-gray-400">
                        Try selecting different activity types or view all activities.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Panel - only show after all agents complete */}
      {allAgentsComplete && (
        <div className="w-96 border-l bg-white">
          <ChatInterface className="h-full border-none shadow-none" />
        </div>
      )}
      {/* Celebration Modal */}
      <Dialog open={showCelebrationModal} onOpenChange={setShowCelebrationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl text-center justify-center">
              <PartyPopper className="w-8 h-8 text-yellow-500" />
              Found your dream vacation!
              <PartyPopper className="w-8 h-8 text-yellow-500" />
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div className="flex justify-center gap-2 text-4xl">
            </div>
            <p className="text-lg text-gray-700">Our AI agents have found amazing options for your trip!</p>
            <p className="text-sm text-gray-600">
              Check out the flights, hotels, and activities we've curated just for you.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => setShowCelebrationModal(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2"
              >
                Let's explore! ✨
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
