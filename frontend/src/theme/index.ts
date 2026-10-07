import { alpha, createTheme, type Shadows } from '@mui/material/styles'

const shadows = [...createTheme().shadows] as Shadows
shadows[1] = '0 2px 8px rgba(17,24,39,0.035)'
shadows[2] = '0 6px 24px rgba(17,24,39,0.055)'
shadows[3] = '0 12px 32px rgba(17,24,39,0.09)'
shadows[4] = '0 20px 48px rgba(17,24,39,0.12)'

const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5', dark: '#312e81', light: '#6366f1' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#475569' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: 10 },
  shadows,
  typography: {
    fontFamily: '"Google Sans Flex", Arial, sans-serif',
    h4: { fontWeight: 650, letterSpacing: '-0.035em', lineHeight: 1.2 },
    h5: { fontWeight: 650, letterSpacing: '-0.025em' },
    h6: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.02em' },
    body2: { lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    overline: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.16em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          backgroundImage: `radial-gradient(ellipse at 90% 0%, ${alpha(theme.palette.primary.main, 0.045)}, transparent 45%)`,
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          backgroundImage: 'none',
          boxShadow: theme.shadows[1],
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: `calc(${typeof theme.shape.borderRadius === 'number' ? `${theme.shape.borderRadius}px` : theme.shape.borderRadius} * 1.5)`,
          boxShadow: theme.shadows[2],
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        colorDefault: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.dark,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          fontWeight: 600,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 500,
          color: theme.palette.text.secondary,
          '&.Mui-selected': { fontWeight: 600 },
          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.035) },
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -3,
            borderRadius: theme.shape.borderRadius,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiAutocomplete: { defaultProps: { size: 'small' } },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          paddingInline: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          minHeight: 40,
          transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color']),
          '&.Mui-focusVisible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.45)}`,
            outlineOffset: 3,
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }),
        contained: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'primary' && {
            backgroundImage: `linear-gradient(115deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          }),
          boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.15)}`,
          '&:hover': {
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.16)}`,
          },
          '&.Mui-disabled': { backgroundImage: 'none', boxShadow: 'none' },
        }),
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.text.secondary,
            backgroundColor: theme.palette.background.default,
          },
        }),
      },
    },
    MuiButtonGroup: { defaultProps: { size: 'small' } },
    MuiCheckbox: { defaultProps: { size: 'small' } },
    MuiChip: { defaultProps: { size: 'small' } },
    MuiFab: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiIconButton: { defaultProps: { size: 'small' } },
    MuiInputBase: { defaultProps: { size: 'small' } },
    MuiInput: { defaultProps: { size: 'small' } },
    MuiFilledInput: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.default,
          minHeight: 44,
          transition: theme.transitions.create(['background-color', 'box-shadow']),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.error.main,
          },
          '&.Mui-error.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.error.main, 0.1)}`,
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }),
      },
    },
    MuiInputLabel: { defaultProps: { size: 'small' } },
    MuiPagination: { defaultProps: { size: 'small' } },
    MuiPaginationItem: { defaultProps: { size: 'small' } },
    MuiRadio: { defaultProps: { size: 'small' } },
    MuiRating: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiSlider: { defaultProps: { size: 'small' } },
    MuiSwitch: { defaultProps: { size: 'small' } },
    MuiTable: { defaultProps: { size: 'small' } },
    MuiTableCell: { defaultProps: { size: 'small' } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiToggleButton: { defaultProps: { size: 'small' } },
    MuiToggleButtonGroup: { defaultProps: { size: 'small' } },
  },
})

export default theme
