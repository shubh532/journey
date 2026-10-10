import { useState } from 'react'

const STORAGE_KEY = 'journey:favorites'

function read(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(read)

  function toggle(id: string) {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Storage can be unavailable (private mode); favourites then last for this visit only.
      }
      return next
    })
  }

  return { favorites, toggle }
}
