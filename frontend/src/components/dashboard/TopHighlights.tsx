import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Landmark, Mountain, Music, ShoppingBag, Sun, Trees, Utensils, Waves, type IconNode } from 'lucide'
import LucideIcon from '../LucideIcon'
import SectionCard from '../layout/SectionCard'
import type { JourneyOverview } from '../journey/overview'

const highlightIcons: Record<string, IconNode> = {
  Adventure: Mountain,
  Nature: Trees,
  Food: Utensils,
  Beaches: Waves,
  Culture: Landmark,
  Nightlife: Music,
  Shopping: ShoppingBag,
  Relaxation: Sun,
}

export default function TopHighlights({ overview }: { overview: JourneyOverview }) {
  return (
    <SectionCard title="Top Highlights">
      <Box
        component="ul"
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 1.25, listStyle: 'none', p: 0, m: 0 }}
      >
        {overview.plan.interests.map((interest) => (
          <Box component="li" key={interest} sx={{ textAlign: 'center' }}>
            <Box
              sx={(theme) => ({
                display: 'grid',
                placeItems: 'center',
                aspectRatio: '1',
                mb: 0.75,
                borderRadius: '8px',
                color: 'primary.dark',
                backgroundImage: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
              })}
            >
              <LucideIcon node={highlightIcons[interest] ?? Sun} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{interest}</Typography>
          </Box>
        ))}
      </Box>
    </SectionCard>
  )
}
