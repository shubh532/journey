import { useRef, useState, type FormEvent } from 'react'
import { Box, Button, ButtonBase, Container, InputBase, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ChevronRight, Landmark, MapPin, Mountain, Search, Sparkles, TreePalm, Waves, type IconNode } from 'lucide'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import type { Destination } from './data'
import { quickPicks } from './exploreData'

const pickIcons: Record<(typeof quickPicks)[number], IconNode> = {
  Goa: MapPin,
  Himachal: Mountain,
  Kerala: TreePalm,
  Dubai: Landmark,
  Bali: Waves,
}

type HomeHeroProps = {
  featured: Destination
  onPlan: (destination: string) => void
}

export default function HomeHero({ featured, onPlan }: HomeHeroProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onPlan(text)
  }

  return (
    <Box
      component="section"
      aria-labelledby="home-hero-title"
      sx={{ position: 'relative', overflow: 'hidden', bgcolor: 'background.paper' }}
    >
      <Box sx={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <ImageWithFallback src={featured.image} alt="" label="" />
      </Box>
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          background: {
            xs: alpha(theme.palette.background.paper, 0.88),
            md: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.paper, 0.92)} 38%, ${alpha(theme.palette.background.paper, 0.15)} 70%, transparent 100%)`,
          },
        })}
      />
      <Container maxWidth={false} sx={{ position: 'relative', px: { xs: 2, md: 3 }, py: { xs: 4, md: 5.5 } }}>
        <Box sx={{ maxWidth: 660 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.14em' }}>
            Your AI travel planner
          </Typography>
          <Typography
            id="home-hero-title"
            component="h1"
            sx={{ fontSize: { xs: 34, md: 48 }, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, mt: 0.5, mb: 1.5 }}
          >
            Discover. Plan.{' '}
            <Box
              component="span"
              sx={(theme) => ({
                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, #8b5cf6)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              })}
            >
              Experience.
            </Box>
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: '46ch', mb: 2.5 }}>
            Let AI craft your perfect journey with personalized itineraries, hidden gems and unforgettable experiences.
          </Typography>
          <Box
            component="form"
            role="search"
            onSubmit={handleSubmit}
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 0.75,
              pl: 2,
              borderRadius: '12px',
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[3],
            })}
          >
            <Box sx={{ color: 'text.secondary', display: 'flex' }}><LucideIcon node={Search} /></Box>
            <InputBase
              inputRef={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Where do you want to go?"
              fullWidth
              inputProps={{ 'aria-label': 'Where do you want to go?', maxLength: 80 }}
            />
            <Button type="submit" variant="contained" startIcon={<LucideIcon node={Sparkles} />} sx={{ flexShrink: 0, minHeight: 44 }}>
              Plan My Journey
            </Button>
          </Box>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, columnGap: 2.5, mt: 1.5 }} role="group" aria-label="Quick destinations">
            {quickPicks.map((pick) => (
              <ButtonBase
                key={pick}
                onClick={() => {
                  setText(pick)
                  inputRef.current?.focus()
                }}
                sx={{ gap: 0.75, py: 0.5, borderRadius: '6px', color: 'text.secondary', fontSize: 13, '&:hover': { color: 'text.primary' } }}
              >
                <LucideIcon node={pickIcons[pick]} />
                {pick}
              </ButtonBase>
            ))}
          </Stack>
        </Box>
      </Container>
      <ButtonBase
        onClick={() => onPlan(featured.name)}
        aria-label={`Plan a trip to ${featured.name}`}
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          position: 'absolute',
          right: 24,
          bottom: 24,
          alignItems: 'center',
          gap: 1.5,
          p: 1.75,
          width: 220,
          textAlign: 'left',
          justifyContent: 'flex-start',
          borderRadius: '12px',
          color: 'common.white',
          backgroundColor: alpha(theme.palette.common.black, 0.45),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.25)}`,
        })}
      >
        <LucideIcon node={MapPin} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, color: 'inherit' }}>{featured.name}</Typography>
          <Typography variant="caption" sx={{ color: 'inherit', opacity: 0.85, display: 'block', lineHeight: 1.3 }}>
            {featured.summary}
          </Typography>
        </Box>
        <LucideIcon node={ChevronRight} />
      </ButtonBase>
    </Box>
  )
}
