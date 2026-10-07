import { useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { MapPin } from 'lucide'
import LucideIcon from '../LucideIcon'

type PlaceImageProps = { src?: string; alt: string; label: string }

export default function PlaceImage({ src, alt, label }: PlaceImageProps) {
  const [failed, setFailed] = useState(false)

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'action.hover', overflow: 'hidden' }}>
      {src && !failed ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
          <LucideIcon node={MapPin} />
          <Typography variant="body2">{label}</Typography>
        </Stack>
      )}
    </Box>
  )
}
