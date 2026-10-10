import { Bus, CalendarDays, Hotel, LayoutDashboard, Lightbulb, Map, Ticket, Utensils, WalletCards } from 'lucide'

export const workspaceTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'Itinerary', icon: CalendarDays },
  { id: 'stay', label: 'Stay', icon: Hotel },
  { id: 'transport', label: 'Transport', icon: Bus },
  { id: 'things', label: 'Things to Do', icon: Ticket },
  { id: 'food', label: 'Food & Drinks', icon: Utensils },
  { id: 'budget', label: 'Budget', icon: WalletCards },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'tips', label: 'Tips', icon: Lightbulb },
] as const

export type WorkspaceTabId = (typeof workspaceTabs)[number]['id']
