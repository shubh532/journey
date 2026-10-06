import { useEffect, useState } from 'react'

export const generationStages = [
  { id: 'preferences', label: 'Understanding your preferences' },
  { id: 'experiences', label: 'Exploring the best experiences' },
  { id: 'itinerary', label: 'Building your itinerary' },
  { id: 'stays', label: 'Finding stays that fit your style' },
  { id: 'budget', label: 'Optimizing your budget' },
  { id: 'finalizing', label: 'Finalizing your journey' },
]

export function useGenerationPreview() {
  const [completedStages, setCompletedStages] = useState(0)

  useEffect(() => {
    let completed = 0
    const timer = window.setInterval(() => {
      completed += 1
      setCompletedStages(completed)
      if (completed === generationStages.length) window.clearInterval(timer)
    }, 800)
    return () => window.clearInterval(timer)
  }, [])

  return {
    completedStages,
    progress: Math.round((completedStages / generationStages.length) * 100),
    complete: completedStages === generationStages.length,
  }
}
