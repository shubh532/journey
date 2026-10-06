import { destinations } from '../home/data'
import type { JourneyPlan } from '../plan/model'

export type JourneyDay = { day: number; title: string }

export type FlightPreview = {
  airline: string
  originCity: string
  originCode: string
  destinationCity: string
  destinationCode: string
  departure: string
  arrival: string
  duration: string
  stops: string
  pricePerPerson: number
}

export type HotelPreview = {
  name: string
  stars: number
  rating: number
  area: string
  amenities: string[]
  pricePerNight: number
  nights: number
  image: string
  imageAlt: string
}

export type BudgetItem = { label: string; amount: number }

export type JourneyOverview = {
  plan: JourneyPlan
  title: string
  days: number
  budget: number
  estimatedCost: number
  coverImage?: { src: string; alt: string }
  itineraryPreview: JourneyDay[]
  hiddenDays: number
  flight: FlightPreview
  hotel: HotelPreview
  budgetBreakdown: BudgetItem[]
  summary: string
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
export const formatCurrency = (amount: number) => currencyFormatter.format(amount)

const dayMs = 86_400_000
const previewDayLimit = 5

const interestThemes: Record<string, string> = {
  Adventure: 'Adventure & outdoor activities',
  Nature: 'Nature & scenic escapes',
  Food: 'Local food trail',
  Beaches: 'Beaches & coastline',
  Culture: 'Culture & heritage',
  Nightlife: 'Evenings out & nightlife',
  Shopping: 'Markets & shopping',
  Relaxation: 'A slow, relaxed day',
}

// Mock-only: arbitrary city names have no real airport lookup yet.
const airportCodes: Record<string, string> = {
  ahmedabad: 'AMD',
  goa: 'GOI',
  manali: 'KUU',
  kerala: 'COK',
  bali: 'DPS',
  dubai: 'DXB',
  paris: 'CDG',
}
const airportCode = (city: string) =>
  airportCodes[city.trim().toLowerCase()] ?? city.trim().slice(0, 3).toUpperCase()

const styleProfiles = {
  Budget: {
    spend: 0.78,
    hotel: { name: 'Sunrise Stay', stars: 3, rating: 4.2, amenities: ['Breakfast', 'Wi-Fi', 'Air conditioning'] },
  },
  Balanced: {
    spend: 0.85,
    hotel: { name: 'Azure Bay Resort', stars: 4, rating: 4.5, amenities: ['Breakfast', 'Pool', 'Wi-Fi'] },
  },
  Luxury: {
    spend: 0.92,
    hotel: { name: 'The Grand Horizon', stars: 5, rating: 4.8, amenities: ['Breakfast', 'Pool', 'Spa'] },
  },
} as const

const fallbackHotelImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'

const roundTo = (value: number, unit: number) => Math.max(unit, Math.round(value / unit) * unit)

function buildItinerary(plan: JourneyPlan, days: number): JourneyDay[] {
  return Array.from({ length: Math.min(days, previewDayLimit) }, (_, index) => {
    const day = index + 1
    if (days === 1) return { day, title: `${plan.destination} highlights` }
    if (day === 1) return { day, title: `Arrival & settling in` }
    if (day === days) return { day, title: 'Final morning & departure' }
    const theme = interestThemes[plan.interests[(day - 2) % plan.interests.length]]
    return { day, title: theme ?? `Exploring ${plan.destination}` }
  })
}

export function buildJourneyOverview(plan: JourneyPlan): JourneyOverview {
  const budget = Number(plan.budget)
  const days = Math.max(
    1,
    Math.round((Date.parse(`${plan.endDate}T00:00:00`) - Date.parse(`${plan.startDate}T00:00:00`)) / dayMs) + 1,
  )
  const nights = Math.max(days - 1, 1)
  const profile = styleProfiles[plan.travelStyle]
  const target = budget * profile.spend

  const pricePerPerson = roundTo((target * 0.3) / plan.travelers, 10)
  const pricePerNight = roundTo((target * 0.53) / nights, 100)
  const flights = pricePerPerson * plan.travelers
  const stay = pricePerNight * nights
  const food = roundTo(target * 0.094, 100)
  const activities = roundTo(target * 0.059, 100)
  const localTravel = roundTo(target * 0.017, 10)

  const destination = destinations.find((item) => item.name.toLowerCase() === plan.destination.trim().toLowerCase())
  const interestList = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(
    plan.interests.map((interest) => interest.toLowerCase()),
  )

  return {
    plan,
    title: `${plan.destination} Journey`,
    days,
    budget,
    estimatedCost: flights + stay + food + activities + localTravel,
    coverImage: destination && { src: destination.image, alt: destination.imageAlt },
    itineraryPreview: buildItinerary(plan, days),
    hiddenDays: Math.max(days - previewDayLimit, 0),
    flight: {
      airline: 'IndiGo',
      originCity: plan.origin,
      originCode: airportCode(plan.origin),
      destinationCity: plan.destination,
      destinationCode: airportCode(plan.destination),
      departure: '06:20',
      arrival: '08:05',
      duration: '1h 45m',
      stops: 'Non-stop',
      pricePerPerson,
    },
    hotel: {
      ...profile.hotel,
      amenities: [...profile.hotel.amenities],
      area: `${plan.destination} · Near the main attractions`,
      pricePerNight,
      nights,
      image: fallbackHotelImage,
      imageAlt: `${profile.hotel.name} exterior and pool`,
    },
    budgetBreakdown: [
      { label: 'Flights', amount: flights },
      { label: 'Stay', amount: stay },
      { label: 'Food', amount: food },
      { label: 'Activities', amount: activities },
      { label: 'Local travel', amount: localTravel },
    ],
    summary: `This journey balances ${interestList} while keeping the plan within your budget.`,
  }
}
