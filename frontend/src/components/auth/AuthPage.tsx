import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Link as RouterLink, useNavigate } from 'react-router'
import { Route, Sparkles, WalletCards } from 'lucide'
import googleLogo from '../../assets/google.svg'
import LucideIcon from '../LucideIcon'
import Wordmark from '../layout/Wordmark'
import { brandGradient, glassSurface } from '../../theme/tokens'
import motion from '../../theme/motion.module.css'
import { ApiError } from '../../services/apiError'
import { authApi } from '../../services/authApi'
import PasswordField from './PasswordField'
import { validateAuth, type AuthValues } from './validation'

const brandPoints = [
  { icon: Sparkles, label: 'Itineraries shaped around your interests' },
  { icon: WalletCards, label: 'A budget you can see from the very start' },
  { icon: Route, label: 'One workspace for your whole trip' },
]

type AuthPageProps = {
  mode: 'signin' | 'signup'
}

type Notice = {
  severity: 'info' | 'error'
  message: string
}

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate()
  const isSignUp = mode === 'signup'
  const [values, setValues] = useState<AuthValues>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [touched, setTouched] = useState<
    Partial<Record<keyof AuthValues, boolean>>
  >({})
  const [attempted, setAttempted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice | null>(null)
  const submitting = useRef(false)
  const errors = validateAuth(values, isSignUp)

  function fieldProps(name: keyof AuthValues) {
    const error = attempted || touched[name] ? errors[name] : undefined

    return {
      id: `auth-${name}`,
      name,
      value: values[name],
      required: true,
      fullWidth: true,
      error: Boolean(error),
      helperText: error,
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        setValues((current) => ({ ...current, [name]: event.target.value }))
        setNotice(null)
      },
      onBlur: () => {
        setTouched((current) => ({ ...current, [name]: true }))
        if (name === 'name' || name === 'email') {
          setValues((current) => ({ ...current, [name]: current[name].trim() }))
        }
      },
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return

    setAttempted(true)
    setNotice(null)
    const firstError = Object.keys(errors)[0] as keyof AuthValues | undefined

    if (firstError) {
      event.currentTarget
        .querySelector<HTMLInputElement>(`[name="${firstError}"]`)
        ?.focus()
      return
    }

    submitting.current = true
    setIsSubmitting(true)

    try {
      if (isSignUp) {
        await authApi.register(values.name, values.email, values.password)
      } else {
        await authApi.login(values.email, values.password)
      }
      navigate('/home')
    } catch (error) {
      setNotice({
        severity: 'error',
        message:
          error instanceof ApiError
            ? error.message
            : 'Something went wrong. Please try again.',
      })
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  const passwordProps = fieldProps('password')

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100svh',
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)' },
      }}
    >
      <title>{isSignUp ? 'Create account' : 'Sign in'} | Journey</title>
      <Box
        sx={(theme) => ({
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { md: 6, lg: 8 },
          color: 'common.white',
          backgroundImage: brandGradient(theme),
        })}
      >
        <Box
          aria-hidden="true"
          className={motion.floatGlow}
          sx={(theme) => ({
            position: 'absolute',
            width: 520,
            height: 520,
            top: '-12%',
            right: '-18%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.22)}, transparent 65%)`,
          })}
        />
        <Box
          aria-hidden="true"
          sx={(theme) => ({
            position: 'absolute',
            width: 420,
            height: 420,
            bottom: '-14%',
            left: '-10%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.35)}, transparent 65%)`,
          })}
        />
        <Wordmark size="lg" light />
        <Box sx={{ position: 'relative', maxWidth: 460 }}>
          <Typography component="p" variant="h2" sx={{ mb: 3 }}>
            Plan trips that feel made for you.
          </Typography>
          <Stack component="ul" spacing={2} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {brandPoints.map((point) => (
              <Stack component="li" key={point.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Box
                  sx={(theme) => ({
                    display: 'grid',
                    placeItems: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.common.white, 0.16),
                    border: `1px solid ${alpha(theme.palette.common.white, 0.24)}`,
                  })}
                >
                  <LucideIcon node={point.icon} />
                </Box>
                <Typography sx={{ opacity: 0.92 }}>{point.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Typography variant="caption" sx={{ position: 'relative', opacity: 0.8 }}>
          Your next chapter starts here.
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 2, sm: 3 } }}>
        <Box sx={{ width: '100%', maxWidth: 440, py: 2 }} className={motion.fadeUp}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, textAlign: 'center', mb: 3 }}>
            <Wordmark size="lg" />
          </Box>
          <Paper
            variant="outlined"
            sx={(theme) => ({ ...glassSurface(theme), p: { xs: 3, sm: 4 }, borderRadius: 5 })}
          >
          <Stack spacing={3}>
            <Box>
              <Typography
                component="h1"
                variant="h4"
                sx={{ mb: 1 }}
              >
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSignUp
                  ? 'Start planning smarter trips with Journey.'
                  : 'Sign in to continue planning your next adventure.'}
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              startIcon={<img src={googleLogo} alt="" width={18} height={18} />}
              onClick={() =>
                setNotice({
                  severity: 'info',
                  message: 'Google sign in is not connected in this UI preview.',
                })
              }
            >
              Login With Google
            </Button>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                or continue with email
              </Typography>
            </Divider>
            {notice && (
              <Alert
                severity={notice.severity}
                role={notice.severity === 'error' ? 'alert' : 'status'}
              >
                {notice.message}
              </Alert>
            )}
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <Stack spacing={2.5}>
                {isSignUp && (
                  <TextField
                    {...fieldProps('name')}
                    label="Full name"
                    autoComplete="name"
                  />
                )}
                <TextField
                  {...fieldProps('email')}
                  label="Email address"
                  type="email"
                  autoComplete="email"
                />
                <PasswordField
                  {...passwordProps}
                  label="Password"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  helperText={
                    passwordProps.helperText ||
                    (isSignUp
                      ? 'Use 8+ characters with uppercase, lowercase, and a number.'
                      : undefined)
                  }
                />
                {isSignUp ? (
                  <PasswordField
                    {...fieldProps('confirmPassword')}
                    label="Confirm password"
                    autoComplete="new-password"
                  />
                ) : (
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    sx={{ alignSelf: 'flex-end' }}
                    onClick={() =>
                      setNotice({
                        severity: 'info',
                        message: 'Password reset is not available in this UI preview.',
                      })
                    }
                  >
                    Forgot password?
                  </Link>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  loading={isSubmitting}
                >
                  {isSubmitting
                    ? (isSignUp ? 'Creating account...' : 'Signing in...')
                    : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </Stack>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link component={RouterLink} to={isSignUp ? '/signin' : '/signup'}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Link>
            </Typography>
          </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
