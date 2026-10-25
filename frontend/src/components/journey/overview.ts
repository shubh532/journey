import { destinations } from '../home/data'
import type { Activity } from '../dashboard/itinerary'
import type { JourneyPlan } from '../plan/model'
import type { ItineraryItemDto, JourneyDto } from '../../services/journeyApi'

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

// The API has no hotel photos yet.
const fallbackHotelImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'

function buildItineraryPreview(plan: JourneyPlan, days: number): JourneyDay[] {
  return Array.from({ length: Math.min(days, previewDayLimit) }, (_, index) => {
    const day = index + 1
    if (days === 1) return { day, title: `${plan.destination} highlights` }
    if (day === 1) return { day, title: 'Arrival & settling in' }
    if (day === days) return { day, title: 'Final morning & departure' }
    const theme = interestThemes[plan.interests[(day - 2) % plan.interests.length]]
    return { day, title: theme ?? `Exploring ${plan.destination}` }
  })
}

export type JourneyView = { overview: JourneyOverview; itinerary: Activity[] }

/** Maps an API journey to the dashboard's view models; null when it has no generated content yet. */
export function fromJourneyDto(dto: JourneyDto): JourneyView | null {
  const { flight, stay, budgetBreakdown, itinerary, summary, estimatedCost } = dto
  if (!flight || !stay || !budgetBreakdown || !itinerary || summary === undefined || estimatedCost === undefined) {
    return null
  }

  const plan: JourneyPlan = {
    origin: dto.origin,
    destination: dto.destination,
    startDate: dto.startDate,
    endDate: dto.endDate,
    travelers: dto.travelers,
    tripType: dto.tripType,
    budget: String(dto.budget),
    travelStyle: dto.travelStyle,
    interests: dto.interests,
  }
  const days = Math.max(
    1,
    Math.round((Date.parse(`${dto.endDate}T00:00:00`) - Date.parse(`${dto.startDate}T00:00:00`)) / dayMs) + 1,
  )
  const destination = destinations.find((item) => item.name.toLowerCase() === dto.destination.trim().toLowerCase())

  return {
    overview: {
      plan,
      title: dto.title,
      days,
      budget: dto.budget,
      estimatedCost,
      coverImage: destination && { src: destination.image, alt: destination.imageAlt },
      itineraryPreview: buildItineraryPreview(plan, days),
      hiddenDays: Math.max(days - previewDayLimit, 0),
      flight,
      hotel: { ...stay, image: fallbackHotelImage, imageAlt: `${stay.name} exterior` },
      budgetBreakdown,
      summary,
    },
    itinerary: itinerary.map(toActivity),
  }
}

export function toActivity(item: ItineraryItemDto): Activity {
  return {
    id: item.id,
    day: item.day,
    minutes: item.startMinutes,
    title: item.title,
    place: item.place ?? '',
    description: item.description ?? '',
    kind: item.kind,
  }
}
