import { Box, ButtonBase, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ImageWithFallback from '../layout/ImageWithFallback'
import LucideIcon from '../LucideIcon'
import { destinations } from './data'
import { categories } from './exploreData'

type CategoryRowProps = {
  selected: string | null
  onSelect: (id: string | null) => void
}

const imageFor = (id?: string) => destinations.find((destination) => destination.id === id)

export default function CategoryRow({ selected, onSelect }: CategoryRowProps) {
  return (
    <Box
      component="ul"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(8, minmax(0, 1fr))' },
        gap: 1.5,
        listStyle: 'none',
        p: 0,
        m: 0,
      }}
    >
      {categories.map((category) => {
        const active = selected === category.id
        const source = imageFor(category.imageFrom)
        return (
          <Box component="li" key={category.id} sx={{ display: 'flex' }}>
            <ButtonBase
              aria-pressed={active}
              onClick={() => onSelect(active ? null : category.id)}
              sx={(theme) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
                textAlign: 'left',
                overflow: 'hidden',
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                boxShadow: active ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}` : theme.shadows[1],
                transition: theme.transitions.create(['box-shadow', 'transform', 'border-color']),
                '@media (hover: hover)': { '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[3] } },
                '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:hover': { transform: 'none' } },
              })}
            >
              <Box sx={{ position: 'relative', height: 92 }}>
                {source ? (
                  <ImageWithFallback src={source.image} alt="" label="" />
                ) : (
                  <Box sx={(theme) => ({ height: '100%', backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(theme.palette.secondary.main, 0.3)})` })} />
                )}
                <Box
                  aria-hidden="true"
                  sx={(theme) => ({
                    position: 'absolute',
                    left: 10,
                    bottom: -14,
                    display: 'grid',
                    placeItems: 'center',
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[2],
                  })}
                >
                  <LucideIcon node={category.icon} />
                </Box>
              </Box>
              <Box sx={{ px: 1.25, pt: 2.25, pb: 1.25 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{category.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>
                  {category.description}
                </Typography>
              </Box>
            </ButtonBase>
          </Box>
        )
      })}
    </Box>
  )
}
