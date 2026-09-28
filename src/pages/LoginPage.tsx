import { useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 400 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            textAlign: 'center',
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
        >
          journey<Box component="span" sx={{ color: 'primary.main' }}>.</Box>
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, sm: 4 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: 650, mb: 1 }}
              >
                Welcome back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your details to sign in to your account.
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  fullWidth
                />
                <TextField
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            <Box
                              component="span"
                              sx={{ fontSize: 12, fontWeight: 600 }}
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </Box>
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ py: 1 }}
                >
                  Sign in
                </Button>
                {submitted && (
                  <Alert severity="info">
                    This login form is ready. Connect an authentication service
                    to enable sign in.
                  </Alert>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 3 }}
        >
          Your next chapter starts here.
        </Typography>
      </Box>
    </Box>
  )
}
