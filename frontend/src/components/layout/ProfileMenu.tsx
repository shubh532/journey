import { useEffect, useState } from 'react'
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Skeleton, Tooltip, Typography } from '@mui/material'
import { ChevronDown, LogOut } from 'lucide'
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

export default function ProfileMenu({ showName = false }: { showName?: boolean }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
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
      .catch(() => {
        if (active) setLoadFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  const open = Boolean(anchorEl)
  const initials = user ? getInitials(user.fullName) : ''
  const loading = !user && !loadFailed

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
      <Tooltip title="Account">
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label="Open account menu"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? 'account-menu' : undefined}
          sx={{ p: 0.5, borderRadius: '999px' }}
        >
          {loading ? (
            <Skeleton variant="circular" width={36} height={36} />
          ) : (
            <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{initials}</Avatar>
          )}
          {showName && user && (
            <Box component="span" sx={{ display: { xs: 'none', lg: 'inline-flex' }, alignItems: 'center', gap: 0.5, ml: 1, mr: 0.5 }}>
              <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                {user.fullName.split(/\s+/)[0]}
              </Typography>
              <LucideIcon node={ChevronDown} />
            </Box>
          )}
        </IconButton>
      </Tooltip>
      <Menu
        id="account-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, width: 280 } } }}
      >
        <Box role="presentation" sx={{ display: 'flex', gap: 1.5, alignItems: 'center', px: 2, py: 1.5 }}>
          <Avatar sx={{ width: 44, height: 44 }}>{initials}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {user?.fullName ?? (loadFailed ? 'Account unavailable' : 'Loading...')}
            </Typography>
            <Typography variant="body2" noWrap color="text.secondary">
              {user?.email ?? (loadFailed ? 'Could not load your profile.' : '')}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
          <ListItemIcon><LucideIcon node={LogOut} /></ListItemIcon>
          {isLoggingOut ? 'Signing out...' : 'Log out'}
        </MenuItem>
        {error && (
          <Typography role="alert" variant="caption" color="error" sx={{ display: 'block', px: 2, py: 0.5 }}>
            {error}
          </Typography>
        )}
      </Menu>
    </>
  )
}
