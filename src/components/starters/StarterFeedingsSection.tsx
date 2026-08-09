'use client'

import { useState } from 'react'
import GrowthChart from './GrowthChart'
import FeedingLog from './FeedingLog'

interface Feeding {
  id: string
  fed_at: string
  flour_grams: number | null
  water_grams: number | null
  starter_grams: number | null
  rise_percent: number | null
  peak_hours: number | null
  smell: string | null
  notes: string | null
}

interface Props {
  starterId: string
  starterName: string
  initialFeedings: Feeding[]
}

// GrowthChart and FeedingLog both need the same feeding history, and FeedingLog is what
// mutates it (logging a new feeding). Single source of truth here, updated once after a
// successful save — same pattern BakeCoach uses for progress, just applied across two
// sibling components instead of one. Neither child owns its own copy of this data anymore.
export default function StarterFeedingsSection({ starterId, starterName, initialFeedings }: Props) {
  const [feedings, setFeedings] = useState<Feeding[]>(initialFeedings)

  return (
    <>
      <div className="mb-8">
        <GrowthChart feedings={feedings} />
      </div>

      <FeedingLog
        starterId={starterId}
        starterName={starterName}
        feedings={feedings}
        onFeedingAdded={feeding => setFeedings(prev => [feeding, ...prev])}
      />
    </>
  )
}
