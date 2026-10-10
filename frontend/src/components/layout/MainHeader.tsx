import { useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation } from 'react-router'
import { Box, IconButton, InputAdornment, Popover, TextField, Tooltip, Typography } from '@mui/material'
import { Bell, Search } from 'lucide'
import LucideIcon from '../LucideIcon'
import AppHeader from './AppHeader'

const navItems = [
  { label: 'Home', to: '/home' },
  { label: 'My Trips', to: '/home' },
  { label: 'Explore', to: '/home' },
]

type MainHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  onSubmit?: () => void
}

export default function MainHeader({ query, onQueryChange, onSubmit }: MainHeaderProps) {
  const { pathname } = useLocation()
  const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <AppHeader
      maxWidth={false}
      showProfileName
      nav={
        <Box component="nav" aria-label="Main" sx={{ display: 'flex', gap: 3.5, alignSelf: 'stretch' }}>
          {navItems.map((item) => {
            const active = item.label === 'Home' && pathname === '/home'
            return (
              <Typography
                key={item.label}
                component={RouterLink}
                to={item.to}
                variant="body2"
                aria-current={active ? 'page' : undefined}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  color: active ? 'text.primary' : 'text.secondary',
                  textDecoration: 'none',
                  fontWeight: active ? 600 : 500,
                  '&:hover': { color: 'text.primary' },
                  '&::after': active
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: -12,
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: theme.palette.primary.main,
                      }
                    : undefined,
                })}
              >
                {item.label}
              </Typography>
            )
          })}
        </Box>
      }
      search={
        <Box component="form" role="search" onSubmit={handleSubmit}>
          <TextField
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search destinations, experiences..."
            fullWidth
            slotProps={{
              htmlInput: { 'aria-label': 'Search destinations' },
              input: {
                sx: { borderRadius: '999px', minHeight: 40 },
                startAdornment: (
                  <InputAdornment position="start">
                    <LucideIcon node={Search} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      }
      actions={
        <>
          <Tooltip title="Notifications">
            <IconButton aria-label="Notifications" onClick={(event) => setBellAnchor(event.currentTarget)}>
              <LucideIcon node={Bell} />
            </IconButton>
          </Tooltip>
          <Popover
            open={Boolean(bellAnchor)}
            anchorEl={bellAnchor}
            onClose={() => setBellAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { mt: 1, p: 2, width: 260 } } }}
          >
            <Typography sx={{ fontWeight: 600 }}>Notifications</Typography>
            <Typography variant="body2" color="text.secondary">You're all caught up.</Typography>
          </Popover>
        </>
      }
    />
  )
}
