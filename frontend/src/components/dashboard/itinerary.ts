import type { JourneyOverview } from '../journey/overview'

export type ActivityKind = 'travel' | 'stay' | 'food' | 'activity'

export type Activity = {
  id: string
  day: number
  minutes: number
  title: string
  place: string
  description: string
  kind: ActivityKind
  image?: string
}

export type Suggestion = Omit<Activity, 'day'>

const at = (hours: number, minutes = 0) => hours * 60 + minutes

export function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')} ${suffix}`
}

export function dayDate(startDate: string, day: number) {
  const date = new Date(`${startDate}T00:00:00`)
  date.setDate(date.getDate() + day - 1)
  return date
}

const interestActivities: Record<string, { title: string; description: string }> = {
  Adventure: { title: 'Guided adventure activity', description: 'An active outing with a local guide, suited to your pace.' },
  Nature: { title: 'Scenic nature walk', description: 'Unhurried time outdoors at one of the area\'s scenic spots.' },
  Food: { title: 'Local food tasting', description: 'Sample regional specialities at well-loved local eateries.' },
  Beaches: { title: 'Beach time & water sports', description: 'Relax on the coast or try a water activity.' },
  Culture: { title: 'Heritage & culture visit', description: 'Explore landmarks, museums and the story of the place.' },
  Nightlife: { title: 'Evening out', description: 'Live music, bars or a lively night market.' },
  Shopping: { title: 'Local market stroll', description: 'Browse crafts, souvenirs and local products.' },
  Relaxation: { title: 'Slow afternoon & spa', description: 'A deliberately unscheduled stretch to recharge.' },
}

const activityFor = (interest: string | undefined, destination: string) =>
  (interest && interestActivities[interest]) || {
    title: `Explore ${destination}`,
    description: 'Time to explore at your own pace.',
  }

export function buildDailyItinerary(overview: JourneyOverview): Activity[] {
  const { plan, days, hotel, flight } = overview
  const { destination, interests } = plan
  const around = `Around ${destination}`
  const items: Activity[] = []
  const add = (
    day: number,
    minutes: number,
    kind: ActivityKind,
    title: string,
    place: string,
    description: string,
    image?: string,
  ) => items.push({ id: `base-${day}-${minutes}`, day, minutes, kind, title, place, description, image })
  const interestAt = (offset: number) => activityFor(interests[offset % Math.max(interests.length, 1)], destination)

  for (let day = 1; day <= days; day++) {
    if (days === 1) {
      add(day, at(9), 'food', 'Breakfast', around, 'Start the day with a local breakfast.')
      add(day, at(11), 'activity', interestAt(0).title, around, interestAt(0).description)
      add(day, at(13), 'food', 'Lunch', around, 'A relaxed lunch at a local favourite.')
      add(day, at(16), 'activity', interestAt(1).title, around, interestAt(1).description)
    } else if (day === 1) {
      const [hours, minutes] = flight.arrival.split(':').map(Number)
      add(day, at(hours, minutes), 'travel', `Arrive in ${destination}`, `${flight.destinationCode} Airport`, 'Arrive and transfer to your hotel.')
      add(day, at(11), 'stay', `Check-in at ${hotel.name}`, hotel.area, 'Settle in and freshen up.', hotel.image)
      add(day, at(13), 'food', 'Lunch', around, 'A relaxed first meal at a local favourite.')
      add(day, at(16), 'activity', interestAt(0).title, around, interestAt(0).description)
      add(day, at(20), 'food', 'Dinner', around, 'Dinner somewhere easy near your hotel.')
    } else if (day === days) {
      add(day, at(9), 'food', 'Breakfast & check-out', hotel.name, 'A slow final breakfast, then check out.')
      add(day, at(11), 'activity', 'Last look around', around, 'A final stroll or some last-minute shopping.')
      add(day, at(15), 'travel', `Depart ${destination}`, `${flight.destinationCode} Airport`, 'Head to the airport for your journey home.')
    } else {
      add(day, at(9), 'food', 'Breakfast', hotel.name, 'Start the day with breakfast at your hotel.')
      add(day, at(11), 'activity', interestAt(day - 2).title, around, interestAt(day - 2).description)
      add(day, at(13), 'food', 'Lunch', around, 'Lunch at a well-reviewed local spot.')
      add(day, at(16), 'activity', interestAt(day - 1).title, around, interestAt(day - 1).description)
      add(day, at(20), 'food', 'Dinner', around, 'Dinner to round off the day.')
    }
  }
  return items
}

export function mergeItinerary(base: Activity[], added: Activity[]) {
  return [...base, ...added].sort((a, b) => a.day - b.day || a.minutes - b.minutes)
}

const suggestionSlots = [at(10), at(16, 30), at(18, 30)]

export function buildSuggestions(overview: JourneyOverview): Suggestion[] {
  const { plan } = overview
  return plan.interests.slice(0, 3).map((interest, index) => {
    const activity = activityFor(interest, plan.destination)
    return {
      id: `suggest-${interest}`,
      minutes: suggestionSlots[index],
      kind: 'activity',
      title: activity.title,
      place: `Around ${plan.destination}`,
      description: activity.description,
    }
  })
}

const coordinates: Record<string, [lat: number, lon: number]> = {
  goa: [15.4909, 73.8278],
  manali: [32.2396, 77.1887],
  kerala: [9.9312, 76.2673],
  bali: [-8.4095, 115.1889],
  dubai: [25.2048, 55.2708],
  paris: [48.8566, 2.3522],
}

export function mapEmbedUrl(destination: string) {
  const point = coordinates[destination.trim().toLowerCase()]
  if (!point) return null
  const [lat, lon] = point
  const span = 0.35
  const bbox = [lon - span, lat - span, lon + span, lat + span].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lon}`
}
