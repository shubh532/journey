export type AuthValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export type AuthErrors = Partial<Record<keyof AuthValues, string>>

export function validateAuth(values: AuthValues, isSignUp: boolean): AuthErrors {
  const errors: AuthErrors = {}

  if (isSignUp && !values.name.trim()) {
    errors.name = 'Enter your full name.'
  }

  if (!values.email.trim()) {
    errors.email = 'Enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Enter your password.'
  } else if (
    isSignUp &&
    (values.password.length < 8 ||
      !/[A-Z]/.test(values.password) ||
      !/[a-z]/.test(values.password) ||
      !/[0-9]/.test(values.password))
  ) {
    errors.password = 'Use at least 8 characters with uppercase, lowercase, and a number.'
  }

  if (isSignUp && !values.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.'
  } else if (isSignUp && values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords must match.'
  }

  return errors
}
