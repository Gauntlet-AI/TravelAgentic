export interface TravelDetails {
  departureLocation: string
  destination: string
  startDate: Date | null
  endDate: Date | null
  travelers: number
  adults: number
  children: number
  travelingWithPets?: boolean
}

export interface Hotel {
  id: string
  name: string
  rating: number
  pricePerNight: number
  image: string
  amenities: string[]
  location: string
  description: string
}

export interface Activity {
  id: string
  name: string
  description: string
  category: string[]
  price: number
  duration: string
  rating: number
  image: string
  location: string
}

export interface ActivityTypeCard {
  id: string
  title: string
  description: string
  icon: string
  image: string
  category: string
}

export interface PreferenceCard {
  id: string
  title: string
  description: string
  image?: string
  priceRange: [number, number]
}

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  departure: {
    airport: string
    city: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  duration: string
  stops: number
  price: number
  class: string
  aircraft: string
}

export const activityTypes: ActivityTypeCard[] = [
  {
    id: "outdoor",
    title: "Outdoor Activities",
    description: "Hiking, parks, nature experiences",
    icon: "🏔️",
    image: "/placeholder.svg?height=200&width=300",
    category: "outdoor",
  },
  {
    id: "indoor",
    title: "Indoor Activities",
    description: "Museums, galleries, shopping",
    icon: "🏛️",
    image: "/placeholder.svg?height=200&width=300",
    category: "indoor",
  },
  {
    id: "nightlife",
    title: "Nightlife & Drinking",
    description: "Bars, clubs, cocktail lounges",
    icon: "🍸",
    image: "/placeholder.svg?height=200&width=300",
    category: "nightlife",
  },
  {
    id: "dancing",
    title: "Dancing & Music",
    description: "Dance clubs, live music venues",
    icon: "💃",
    image: "/placeholder.svg?height=200&width=300",
    category: "dancing",
  },
  {
    id: "sightseeing",
    title: "Sightseeing",
    description: "Landmarks, tours, viewpoints",
    icon: "📸",
    image: "/placeholder.svg?height=200&width=300",
    category: "sightseeing",
  },
  {
    id: "culture",
    title: "Culture & History",
    description: "Museums, historical sites, art",
    icon: "🎭",
    image: "/placeholder.svg?height=200&width=300",
    category: "culture",
  },
  {
    id: "food",
    title: "Food & Dining",
    description: "Restaurants, food tours, cooking",
    icon: "🍽️",
    image: "/placeholder.svg?height=200&width=300",
    category: "food",
  },
  {
    id: "adventure",
    title: "Adventure Sports",
    description: "Extreme sports, water activities",
    icon: "🏄",
    image: "/placeholder.svg?height=200&width=300",
    category: "adventure",
  },
]

// Mock hotel data
export const mockHotels: Hotel[] = [
  {
    id: "hotel-1",
    name: "Grand Plaza Hotel",
    rating: 4.5,
    pricePerNight: 250,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
    location: "Downtown",
    description: "Luxury hotel in the heart of the city",
  },
  {
    id: "hotel-2",
    name: "Boutique Inn",
    rating: 4.2,
    pricePerNight: 180,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Breakfast", "Pet Friendly"],
    location: "Arts District",
    description: "Charming boutique hotel with local character",
  },
  {
    id: "hotel-3",
    name: "Budget Stay",
    rating: 3.8,
    pricePerNight: 95,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Parking"],
    location: "Near Airport",
    description: "Clean and comfortable budget accommodation",
  },
  {
    id: "hotel-4",
    name: "Oceanview Resort",
    rating: 4.7,
    pricePerNight: 320,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Pool", "Spa", "Beach Access", "Pet Friendly"],
    location: "Waterfront",
    description: "Stunning oceanfront resort with world-class amenities",
  },
  {
    id: "hotel-5",
    name: "Historic Manor",
    rating: 4.3,
    pricePerNight: 195,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Restaurant", "Valet Parking", "Concierge"],
    location: "Historic District",
    description: "Elegant historic hotel with timeless charm",
  },
  {
    id: "hotel-6",
    name: "Modern Suites",
    rating: 4.1,
    pricePerNight: 165,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Kitchenette", "Gym", "Pet Friendly"],
    location: "Business District",
    description: "Contemporary suites perfect for extended stays",
  },
  {
    id: "hotel-7",
    name: "Mountain Lodge",
    rating: 4.6,
    pricePerNight: 275,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Fireplace", "Hiking Trails", "Restaurant"],
    location: "Mountain View",
    description: "Rustic lodge with breathtaking mountain views",
  },
  {
    id: "hotel-8",
    name: "City Center Hotel",
    rating: 4.0,
    pricePerNight: 145,
    image: "/placeholder.svg?height=200&width=300",
    amenities: ["WiFi", "Business Center", "Parking"],
    location: "City Center",
    description: "Convenient location with modern amenities",
  },
]

// Mock activities data
export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    name: "Mountain Hiking Trail",
    description: "Scenic 3-hour hike with breathtaking views",
    category: ["outdoor", "adventure"],
    price: 45,
    duration: "3 hours",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300",
    location: "Mountain Ridge",
  },
  {
    id: "activity-2",
    name: "Art Museum Tour",
    description: "Guided tour of contemporary art collections",
    category: ["indoor", "culture"],
    price: 25,
    duration: "2 hours",
    rating: 4.3,
    image: "/placeholder.svg?height=200&width=300",
    location: "Museum District",
  },
  {
    id: "activity-3",
    name: "Rooftop Bar Experience",
    description: "Craft cocktails with city skyline views",
    category: ["nightlife", "sightseeing"],
    price: 60,
    duration: "2-3 hours",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300",
    location: "Downtown",
  },
  {
    id: "activity-4",
    name: "Salsa Dancing Class",
    description: "Learn salsa with professional instructors",
    category: ["dancing", "culture"],
    price: 35,
    duration: "1.5 hours",
    rating: 4.4,
    image: "/placeholder.svg?height=200&width=300",
    location: "Dance Studio",
  },
  {
    id: "activity-5",
    name: "Food Walking Tour",
    description: "Taste local cuisine at 5 different stops",
    category: ["food", "culture", "sightseeing"],
    price: 75,
    duration: "3 hours",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300",
    location: "Historic Quarter",
  },
  {
    id: "activity-6",
    name: "Kayak Adventure",
    description: "Paddle through scenic waterways",
    category: ["outdoor", "adventure"],
    price: 55,
    duration: "2.5 hours",
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=300",
    location: "Riverside Park",
  },
  {
    id: "activity-7",
    name: "Wine Tasting Experience",
    description: "Sample local wines with expert sommelier",
    category: ["food", "indoor"],
    price: 85,
    duration: "2 hours",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300",
    location: "Wine District",
  },
  {
    id: "activity-8",
    name: "Historic Walking Tour",
    description: "Explore the city's rich history and architecture",
    category: ["culture", "sightseeing"],
    price: 30,
    duration: "2.5 hours",
    rating: 4.2,
    image: "/placeholder.svg?height=200&width=300",
    location: "Old Town",
  },
  {
    id: "activity-9",
    name: "Cooking Class",
    description: "Learn to cook authentic local dishes",
    category: ["food", "culture", "indoor"],
    price: 95,
    duration: "3 hours",
    rating: 4.6,
    image: "/placeholder.svg?height=200&width=300",
    location: "Culinary School",
  },
  {
    id: "activity-10",
    name: "Sunset Photography Tour",
    description: "Capture stunning sunset shots at scenic locations",
    category: ["outdoor", "sightseeing"],
    price: 65,
    duration: "2 hours",
    rating: 4.4,
    image: "/placeholder.svg?height=200&width=300",
    location: "Scenic Overlook",
  },
  {
    id: "activity-11",
    name: "Jazz Club Night",
    description: "Live jazz performances in intimate setting",
    category: ["nightlife", "culture"],
    price: 40,
    duration: "3 hours",
    rating: 4.5,
    image: "/placeholder.svg?height=200&width=300",
    location: "Jazz District",
  },
  {
    id: "activity-12",
    name: "Bike City Tour",
    description: "Explore the city on two wheels with local guide",
    category: ["outdoor", "sightseeing"],
    price: 50,
    duration: "3 hours",
    rating: 4.3,
    image: "/placeholder.svg?height=200&width=300",
    location: "City Center",
  },
]

export const mockPreferenceCards: PreferenceCard[] = [
  {
    id: "card-1",
    title: "Beaches & Sun",
    description: "Relax on sandy beaches and soak up the sun.",
    image: "/placeholder.svg?height=200&width=300",
    priceRange: [0, 0],
  },
  {
    id: "card-2",
    title: "City Exploration",
    description: "Discover vibrant cities and cultural landmarks.",
    image: "/placeholder.svg?height=200&width=300",
    priceRange: [50, 200],
  },
  {
    id: "card-3",
    title: "Mountain Adventures",
    description: "Hike scenic trails and enjoy breathtaking views.",
    image: "/placeholder.svg?height=200&width=300",
    priceRange: [20, 80],
  },
]

export const mockFlights: Flight[] = [
  {
    id: "flight-1",
    airline: "Delta Air Lines",
    flightNumber: "DL 1234",
    departure: {
      airport: "ATL",
      city: "Atlanta",
      time: "8:30 AM",
      date: "Jul 16",
    },
    arrival: {
      airport: "SFO",
      city: "San Francisco",
      time: "11:45 AM",
      date: "Jul 16",
    },
    duration: "5h 15m",
    stops: 0,
    price: 425,
    class: "Economy",
    aircraft: "Boeing 737-800",
  },
  {
    id: "flight-2",
    airline: "United Airlines",
    flightNumber: "UA 567",
    departure: {
      airport: "ATL",
      city: "Atlanta",
      time: "2:15 PM",
      date: "Jul 16",
    },
    arrival: {
      airport: "SFO",
      city: "San Francisco",
      time: "5:30 PM",
      date: "Jul 16",
    },
    duration: "5h 15m",
    stops: 0,
    price: 389,
    class: "Economy",
    aircraft: "Airbus A320",
  },
  {
    id: "flight-3",
    airline: "American Airlines",
    flightNumber: "AA 890",
    departure: {
      airport: "ATL",
      city: "Atlanta",
      time: "6:45 PM",
      date: "Jul 16",
    },
    arrival: {
      airport: "SFO",
      city: "San Francisco",
      time: "10:00 PM",
      date: "Jul 16",
    },
    duration: "5h 15m",
    stops: 0,
    price: 456,
    class: "Economy",
    aircraft: "Boeing 777-200",
  },
  {
    id: "flight-4",
    airline: "Southwest Airlines",
    flightNumber: "WN 123",
    departure: {
      airport: "ATL",
      city: "Atlanta",
      time: "10:30 AM",
      date: "Jul 16",
    },
    arrival: {
      airport: "SFO",
      city: "San Francisco",
      time: "3:45 PM",
      date: "Jul 16",
    },
    duration: "7h 15m",
    stops: 1,
    price: 298,
    class: "Economy",
    aircraft: "Boeing 737-700",
  },
]

export { mockPreferenceCards as preferenceCards }
