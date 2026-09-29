import {
  Avatar,
  Box,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { MapPin, Search } from 'lucide'
import { alpha } from '@mui/material/styles'
import LucideIcon from '../LucideIcon'
import { previewUser } from './data'

type HomeHeaderProps = {
  search: string
  onSearchChange: (value: string) => void
}

export default function HomeHeader({ search, onSearchChange }: HomeHeaderProps) {
  return (
    <Box
      component="header"
      sx={(theme) => ({
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        borderBottom: 1,
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
      })}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr auto', md: 'auto minmax(0, 1fr) auto' },
            alignItems: 'center',
            gap: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>
            Journey<Box component="span" sx={{ color: 'primary.main' }}>.</Box>
          </Typography>
          <TextField
            placeholder="Search destinations..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            fullWidth
            sx={{
              gridRow: { xs: 2, md: 1 },
              gridColumn: { xs: '1 / -1', md: 2 },
              '& .MuiOutlinedInput-root': { minHeight: 44 },
            }}
            slotProps={{
              htmlInput: { 'aria-label': 'Search destinations' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LucideIcon node={Search} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack
            direction="row"
            spacing={3}
            sx={{ alignItems: 'center', gridRow: 1, gridColumn: { xs: 2, md: 3 } }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                color: 'text.secondary',
                display: { xs: 'none', sm: 'flex' },
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                px: 1.5,
                py: 1,
              }}
            >
              <LucideIcon node={MapPin} />
              <Typography variant="body2">{previewUser.location}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Avatar
                aria-label={previewUser.name}
                sx={(theme) => ({
                  width: 36,
                  height: 36,
                  fontSize: theme.typography.body2.fontSize,
                  fontWeight: 600,
                })}
              >
                {previewUser.initials}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {previewUser.name}
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              color: 'text.secondary',
              display: { xs: 'flex', sm: 'none' },
              gridColumn: '1 / -1',
              justifySelf: 'start',
              bgcolor: 'background.default',
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
            }}
          >
            <LucideIcon node={MapPin} />
            <Typography variant="body2">{previewUser.location}</Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}

