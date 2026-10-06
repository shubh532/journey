import { CalendarDays, Compass, Hotel, LayoutDashboard, Map, Plane, WalletCards } from 'lucide'

export const workspaceTabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'itinerary', label: 'Itinerary', icon: CalendarDays },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'budget', label: 'Budget', icon: WalletCards },
] as const

export type WorkspaceTabId = (typeof workspaceTabs)[number]['id']
