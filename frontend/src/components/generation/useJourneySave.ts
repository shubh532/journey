import { useEffect, useRef, useState } from 'react'
import { toApiError, type ApiError } from '../../services/apiError'
import { journeyApi } from '../../services/journeyApi'
import type { JourneyPlan } from '../plan/model'

export type JourneySaveState =
  | { status: 'saving' }
  | { status: 'saved'; id: string }
  | { status: 'failed'; error: ApiError }

/** Creates the journey (or updates it when journeyId is given) exactly once per mount. */
export function useJourneySave(plan: JourneyPlan, journeyId?: string): JourneySaveState {
  const [state, setState] = useState<JourneySaveState>({ status: 'saving' })
  const started = useRef(false)

  useEffect(() => {
    // Effects run twice in development; the ref keeps that from creating two journeys.
    if (started.current) return
    started.current = true
    const request = journeyId ? journeyApi.update(journeyId, plan) : journeyApi.create(plan)
    request
      .then((journey) => setState({ status: 'saved', id: journey.id }))
      .catch((error: unknown) => setState({ status: 'failed', error: toApiError(error) }))
  }, [plan, journeyId])

  return state
}
