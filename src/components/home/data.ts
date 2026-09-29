export type Destination = {
  id: string
  name: string
  location: string
  summary: string
  image: string
  imageAlt: string
  category: 'domestic' | 'international'
  packagePrice: number
  persons: number
  days: number
  nights: number
}

export const previewUser = { name: 'Shubham', initials: 'S', location: 'Ahmedabad' }

export const navigationItems = [
  { id: 'upcoming', label: 'Upcoming Journey' },
  { id: 'history', label: 'History' },
  { id: 'domestic', label: 'Domestic' },
  { id: 'international', label: 'International' },
] as const

export type NavigationId = (typeof navigationItems)[number]['id']

export const destinations: Destination[] = [
  {
    id: 'goa',
    packagePrice: 15999,
    persons: 2,
    days: 4,
    nights: 3,
    name: 'Goa',
    location: 'India',
    summary: 'Slow beach days, coastal cuisine, and a little Portuguese charm.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Palm-lined beach and coastal scenery in Goa',
    category: 'domestic',
  },
  {
    id: 'manali',
    packagePrice: 18999,
    persons: 2,
    days: 5,
    nights: 4,
    name: 'Manali',
    location: 'India',
    summary: 'Fresh mountain air, pine forests, and adventures in the Himalayas.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Mountain landscape near Manali',
    category: 'domestic',
  },
  {
    id: 'kerala',
    packagePrice: 24999,
    persons: 2,
    days: 6,
    nights: 5,
    name: 'Kerala',
    location: 'India',
    summary: 'Quiet backwaters, lush green landscapes, and a gentler pace of life.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lush green landscape and waterways in Kerala',
    category: 'domestic',
  },
  {
    id: 'bali',
    packagePrice: 54999,
    persons: 2,
    days: 6,
    nights: 5,
    name: 'Bali',
    location: 'Indonesia',
    summary: 'Terraced rice fields, island sunsets, and temples tucked into nature.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Traditional Balinese architecture surrounded by greenery',
    category: 'international',
  },
  {
    id: 'dubai',
    packagePrice: 45999,
    persons: 2,
    days: 5,
    nights: 4,
    name: 'Dubai',
    location: 'United Arab Emirates',
    summary: 'Bold skylines, desert escapes, and flavors from around the world.',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Dubai skyline with modern towers',
    category: 'international',
  },
  {
    id: 'paris',
    packagePrice: 89999,
    persons: 2,
    days: 7,
    nights: 6,
    name: 'Paris',
    location: 'France',
    summary: 'Neighborhood cafes, iconic art, and unhurried walks along the Seine.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Eiffel Tower rising above Paris',
    category: 'international',
  },
]
