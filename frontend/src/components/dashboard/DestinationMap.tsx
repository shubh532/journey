import { Box, Typography } from '@mui/material'
import { MapPinOff } from 'lucide'
import EmptyState from '../layout/EmptyState'
import SectionCard from '../layout/SectionCard'
import { mapEmbedUrl } from './itinerary'

export default function DestinationMap({ destination, height = 220 }: { destination: string; height?: number }) {
  const url = mapEmbedUrl(destination)

  return (
    <SectionCard title="Destination Map">
      {url ? (
        <>
          <Box
            component="iframe"
            title={`Map of ${destination}`}
            src={url}
            loading="lazy"
            sx={{ display: 'block', width: '100%', height, border: 1, borderColor: 'divider', borderRadius: '8px' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Map data © OpenStreetMap contributors
          </Typography>
        </>
      ) : (
        <EmptyState
          icon={MapPinOff}
          title="Map not available"
          description={`A map for ${destination} isn't available in this preview.`}
        />
      )}
    </SectionCard>
  )
}
