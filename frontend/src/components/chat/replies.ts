import { buildSuggestions, type Suggestion } from '../dashboard/itinerary'
import { formatCurrency, type JourneyOverview } from '../journey/overview'

export type ChatReply = { text: string; offerEditPlan?: boolean; suggestions?: Suggestion[] }

export const suggestedQuestions = [
  'Suggest some activities',
  "What's my budget?",
  'Show my flight',
  'Where am I staying?',
] as const

const dateFormatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })
const formatDate = (value: string) => dateFormatter.format(new Date(`${value}T00:00:00`))
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

type Rule = { test: RegExp; reply: (overview: JourneyOverview) => ChatReply }

const rules: Rule[] = [
  {
    test: /\b(suggest|recommend|idea|activit|things to do|do there|kids|family)/i,
    reply: (o) => ({
      text: `Here are some ideas for ${o.plan.destination}, based on what you love. Add any to your itinerary:`,
      suggestions: buildSuggestions(o),
    }),
  },
  {
    test: /\b(change|modify|edit|update|replace|swap|remove|add|cancel|book|upgrade|downgrade|cheaper|shorter|longer|reschedule)\b/i,
    reply: () => ({
      text:
        "I can't edit your plan or make bookings from typed requests yet, and nothing has been booked. " +
        'Ask me for activity ideas and use the Add buttons, or adjust your preferences in the planner.',
      offerEditPlan: true,
    }),
  },
  {
    test: /\b(hi|hello|hey|thanks|thank you)\b/i,
    reply: (o) => ({
      text: `Happy to help with your trip to ${o.plan.destination}. Ask about activities, budget, flight, stay or the day-by-day plan.`,
    }),
  },
  {
    test: /\b(budget|cost|price|expens|afford|money|spend|total)\b/i,
    reply: (o) => {
      const remaining = o.budget - o.estimatedCost
      const lines = o.budgetBreakdown.map((item) => `• ${item.label}: ${formatCurrency(item.amount)}`)
      return {
        text:
          `Estimated cost is ${formatCurrency(o.estimatedCost)} against your ${formatCurrency(o.budget)} budget, ` +
          `${remaining < 0 ? `${formatCurrency(-remaining)} over` : `${formatCurrency(remaining)} to spare`}.\n\n` +
          `${lines.join('\n')}\n\nThese are estimates, not booking prices.`,
      }
    },
  },
  {
    test: /\b(flight|fly|airline|airport|depart|arriv|plane)\b/i,
    reply: ({ flight, plan }) => ({
      text:
        `${flight.airline}: ${flight.originCity} (${flight.originCode}) ${flight.departure} → ` +
        `${flight.destinationCity} (${flight.destinationCode}) ${flight.arrival}, ${flight.duration}, ${flight.stops}.\n` +
        `About ${formatCurrency(flight.pricePerPerson)} per person, ` +
        `${formatCurrency(flight.pricePerPerson * plan.travelers)} for ${plural(plan.travelers, 'traveler')}. ` +
        'This is a sample suggestion; live fares and availability are not connected yet.',
    }),
  },
  {
    test: /\b(hotel|stay|accommodat|room|night|sleep|resort)\b/i,
    reply: ({ hotel }) => ({
      text:
        `${hotel.name}, a ${hotel.stars}-star stay in ${hotel.area} rated ${hotel.rating}. ` +
        `About ${formatCurrency(hotel.pricePerNight)} per night, ` +
        `${formatCurrency(hotel.pricePerNight * hotel.nights)} for ${plural(hotel.nights, 'night')}.\n` +
        `Amenities: ${hotel.amenities.join(', ')}. This is a sample suggestion; availability is not checked.`,
    }),
  },
  {
    test: /\b(itinerary|schedule|day[- ]by[- ]day|plan)\b/i,
    reply: ({ itineraryPreview, hiddenDays, plan }) => ({
      text:
        `Here is the start of your ${plan.destination} plan:\n` +
        `${itineraryPreview.map((item) => `• Day ${item.day}: ${item.title}`).join('\n')}` +
        (hiddenDays > 0 ? `\n+ ${plural(hiddenDays, 'more day')} in the full itinerary.` : ''),
    }),
  },
  {
    test: /\b(date|when|long|duration|how many days)\b/i,
    reply: ({ plan, days }) => ({
      text: `You travel ${formatDate(plan.startDate)} to ${formatDate(plan.endDate)}, ${plural(days, 'day')} in total.`,
    }),
  },
  {
    test: /\b(traveler|traveller|people|who|group|couple|solo|friends)\b/i,
    reply: ({ plan }) => ({
      text: `${plural(plan.travelers, 'traveler')} on a ${plan.tripType.toLowerCase()} trip, ${plan.travelStyle.toLowerCase()} travel style.`,
    }),
  },
  {
    test: /\b(interest|prefer|love|like|theme)\b/i,
    reply: ({ plan, summary }) => ({
      text: `This journey is planned around: ${plan.interests.join(', ')}.\n\n${summary}`,
    }),
  },
]

export function buildChatReply(overview: JourneyOverview, input: string): ChatReply {
  const rule = rules.find((candidate) => candidate.test.test(input))
  if (rule) return rule.reply(overview)
  return {
    text:
      "I'm not sure about that one. I can suggest activities and answer questions about your budget, " +
      'flight, stay, dates, travelers and day-by-day plan.',
  }
}
