import axiosInstance from './axiosInstance'
import { toApiError } from './apiError'
import type { JourneyPlan } from '../components/plan/model'

export type JourneyStatus = 'DRAFT' | 'GENERATING' | 'READY' | 'FAILED'

export type ItineraryItemDto = {
  id: string
  day: number
  startMinutes: number
  kind: 'travel' | 'stay' | 'food' | 'activity'
  title: string
  place: string | null
  description: string | null
}

export type FlightDto = {
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
  priceSource: 'ESTIMATED' | 'LIVE'
}

export type StayDto = {
  name: string
  stars: number
  rating: number
  area: string
  amenities: string[]
  pricePerNight: number
  nights: number
  priceSource: 'ESTIMATED' | 'LIVE'
}

/** List responses omit flight, stay, budgetBreakdown and itinerary; detail responses include them. */
export type JourneyDto = {
  id: string
  title: string
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  tripType: JourneyPlan['tripType']
  budget: number
  travelStyle: JourneyPlan['travelStyle']
  interests: string[]
  status: JourneyStatus
  summary?: string
  estimatedCost?: number
  createdAt: string
  updatedAt: string
  flight?: FlightDto
  stay?: StayDto
  budgetBreakdown?: { label: string; amount: number }[]
  itinerary?: ItineraryItemDto[]
}

function toRequest(plan: JourneyPlan) {
  return {
    origin: plan.origin,
    destination: plan.destination,
    startDate: plan.startDate,
    endDate: plan.endDate,
    travelers: plan.travelers,
    tripType: plan.tripType,
    budget: Number(plan.budget),
    travelStyle: plan.travelStyle,
    interests: plan.interests,
  }
}

export const journeyApi = {
  async create(plan: JourneyPlan) {
    try {
      const { data } = await axiosInstance.post<JourneyDto>('/api/journeys', toRequest(plan))
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async update(id: string, plan: JourneyPlan) {
    try {
      const { data } = await axiosInstance.patch<JourneyDto>(`/api/journeys/${id}`, toRequest(plan))
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async get(id: string) {
    try {
      const { data } = await axiosInstance.get<JourneyDto>(`/api/journeys/${id}`)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async list() {
    try {
      const { data } = await axiosInstance.get<JourneyDto[]>('/api/journeys')
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async addItem(id: string, item: Pick<ItineraryItemDto, 'day' | 'startMinutes' | 'kind' | 'title' | 'place' | 'description'>) {
    try {
      const { data } = await axiosInstance.post<ItineraryItemDto>(`/api/journeys/${id}/items`, item)
      return data
    } catch (error) {
      throw toApiError(error)
    }
  },

  async remove(id: string) {
    try {
      await axiosInstance.delete(`/api/journeys/${id}`)
    } catch (error) {
      throw toApiError(error)
    }
  },
}
