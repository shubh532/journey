import { Box, InputAdornment, TextField, Typography } from '@mui/material'
import { MapPin, Search } from 'lucide'
import AppHeader from '../layout/AppHeader'
import LucideIcon from '../LucideIcon'
import { previewUser } from './data'

type HomeHeaderProps = {
  search: string
  onSearchChange: (value: string) => void
}

export default function HomeHeader({ search, onSearchChange }: HomeHeaderProps) {
  return (
    <AppHeader
      search={
        <TextField
          placeholder="Search destinations..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          fullWidth
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
      }
      actions={
        <Box
          role="note"
          aria-label={`Your location: ${previewUser.location}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 999,
            boxShadow: 1,
            px: { xs: 1, sm: 1.5 },
            py: 0.75,
          }}
        >
          <LucideIcon node={MapPin} />
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {previewUser.location}
          </Typography>
        </Box>
      }
    />
  )
}
