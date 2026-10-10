import { useState } from 'react'
import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { ImageOff } from 'lucide'
import LucideIcon from '../LucideIcon'

type ImageWithFallbackProps = { src?: string; alt: string; label: string }

export default function ImageWithFallback({ src, alt, label }: ImageWithFallbackProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const showImage = src && status !== 'failed'

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: 'action.hover', overflow: 'hidden' }}>
      {showImage ? (
        <>
          {status === 'loading' && (
            <Skeleton variant="rectangular" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          )}
          <Box
            component="img"
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setStatus('loaded')}
            onError={() => setStatus('failed')}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: status === 'loaded' ? 1 : 0,
              transition: 'opacity 300ms ease',
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        </>
      ) : (
        <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', p: 2, color: 'text.secondary', textAlign: 'center' }}>
          <LucideIcon node={ImageOff} />
          <Typography variant="body2">{label}</Typography>
        </Stack>
      )}
    </Box>
  )
}
