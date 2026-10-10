import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Typography,
} from '@mui/material'
import { LogOut } from 'lucide'
import { useNavigate } from 'react-router'
import LucideIcon from '../LucideIcon'
import { authApi, type CurrentUser } from '../../services/authApi'

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export default function ProfileMenu() {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    authApi
      .me()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const open = Boolean(anchorEl)
  const initials = user ? getInitials(user.fullName) : ''

  function handleClose() {
    setAnchorEl(null)
    setError(null)
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    setError(null)
    try {
      await authApi.logout()
      navigate('/signin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign out.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
        sx={{ p: 0.5 }}
      >
        <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600 }}>
          {initials}
        </Avatar>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, width: 280 } } }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', p: 2 }}>
          <Avatar sx={{ width: 44, height: 44, fontWeight: 600 }}>{initials}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body1" noWrap sx={{ fontWeight: 600 }}>
              {user?.fullName ?? 'Signed in'}
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="inherit"
            onClick={handleLogout}
            disabled={isLoggingOut}
            startIcon={<LucideIcon node={LogOut} />}
            sx={{ justifyContent: 'flex-start' }}
          >
            {isLoggingOut ? 'Signing out...' : 'Log out'}
          </Button>
          {error && (
            <Typography variant="caption" color="error" sx={{ px: 1 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Popover>
    </>
  )
}
