import { useEffect, useState } from 'react'

export const generationStages = [
  { id: 'preferences', label: 'Understanding your preferences' },
  { id: 'experiences', label: 'Exploring the best experiences' },
  { id: 'itinerary', label: 'Building your itinerary' },
  { id: 'stays', label: 'Finding stays that fit your style' },
  { id: 'budget', label: 'Optimizing your budget' },
  { id: 'finalizing', label: 'Finalizing your journey' },
]

// Generation runs on the server and takes as long as it takes, so stages advance slowly and the
// last one stays pending until the journey has actually been saved.
const STAGE_INTERVAL_MS = 4000
const lastPacedStage = generationStages.length - 1

export function useGenerationPreview(finished: boolean) {
  const [pacedStages, setPacedStages] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPacedStages((current) => {
        if (current + 1 >= lastPacedStage) window.clearInterval(timer)
        return Math.min(current + 1, lastPacedStage)
      })
    }, STAGE_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [])

  const completedStages = finished ? generationStages.length : pacedStages

  return {
    completedStages,
    progress: Math.round((completedStages / generationStages.length) * 100),
    complete: finished,
  }
}
