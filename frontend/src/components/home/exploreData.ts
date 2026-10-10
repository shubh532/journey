import { Footprints, Gem, Globe, Flower2, Heart, Map, Umbrella, Users, type IconNode } from 'lucide'
import type { Destination } from './data'

export type Category = {
  id: string
  label: string
  description: string
  icon: IconNode
  imageFrom?: string
  matches: (destination: Destination) => boolean
}

const hasTag = (tag: string) => (destination: Destination) => destination.tags.includes(tag)

export const categories: Category[] = [
  { id: 'states', label: 'States', description: 'Explore incredible Indian states', icon: Map, imageFrom: 'kerala', matches: (d) => d.category === 'domestic' },
  { id: 'countries', label: 'Countries', description: 'Discover amazing destinations worldwide', icon: Globe, imageFrom: 'paris', matches: (d) => d.category === 'international' },
  { id: 'honeymoon', label: 'Honeymoon', description: 'Romantic getaways for special moments', icon: Heart, imageFrom: 'bali', matches: hasTag('Honeymoon') },
  { id: 'beaches', label: 'Beaches', description: 'Sun, sand and serene coastlines', icon: Umbrella, imageFrom: 'goa', matches: hasTag('Beaches') },
  { id: 'spiritual', label: 'Spiritual', description: 'Peace, spirituality and sacred places', icon: Flower2, matches: hasTag('Spiritual') },
  { id: 'adventure', label: 'Adventure', description: 'Trekking, nature and thrilling experiences', icon: Footprints, imageFrom: 'manali', matches: hasTag('Adventure') },
  { id: 'luxury', label: 'Luxury', description: 'Premium stays and exclusive experiences', icon: Gem, imageFrom: 'dubai', matches: hasTag('Luxury') },
  { id: 'family', label: 'Family', description: 'Fun and safe trips for the whole family', icon: Users, imageFrom: 'goa', matches: hasTag('Family') },
]

export type PlaceTile = { name: string; imageFrom?: string }

export const indiaStates: PlaceTile[] = [
  { name: 'Goa', imageFrom: 'goa' },
  { name: 'Kerala', imageFrom: 'kerala' },
  { name: 'Himachal Pradesh', imageFrom: 'manali' },
  { name: 'Rajasthan' },
  { name: 'Uttarakhand' },
  { name: 'Maharashtra' },
]

export const worldPlaces: PlaceTile[] = [
  { name: 'Bali', imageFrom: 'bali' },
  { name: 'Dubai', imageFrom: 'dubai' },
  { name: 'Maldives' },
  { name: 'Singapore' },
  { name: 'Thailand' },
  { name: 'Switzerland' },
]

export const quickPicks = ['Goa', 'Himachal', 'Kerala', 'Dubai', 'Bali'] as const
