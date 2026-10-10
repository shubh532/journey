import { alpha, createTheme, type Shadows } from '@mui/material/styles'
import { radii } from './tokens'

const ink = '#0f172a'

const shadows = [...createTheme().shadows] as Shadows
shadows[1] = `0 1px 2px ${alpha(ink, 0.04)}, 0 1px 1px ${alpha(ink, 0.03)}`
shadows[2] = `0 1px 2px ${alpha(ink, 0.04)}, 0 6px 20px ${alpha(ink, 0.05)}`
shadows[3] = `0 2px 4px ${alpha(ink, 0.04)}, 0 12px 32px ${alpha(ink, 0.08)}`
shadows[4] = `0 4px 8px ${alpha(ink, 0.05)}, 0 24px 48px ${alpha(ink, 0.12)}`

const reducedMotion = '@media (prefers-reduced-motion: reduce)'

const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5', dark: '#3730a3', light: '#818cf8' },
    secondary: { main: '#7c3aed' },
    success: { main: '#047857' },
    warning: { main: '#b45309' },
    error: { main: '#dc2626' },
    info: { main: '#4338ca' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
    text: { primary: ink, secondary: '#475569' },
    divider: '#e2e8f0',
  },
  shape: { borderRadius: radii.control },
  shadows,
  typography: {
    fontFamily: '"Google Sans Flex", Arial, sans-serif',
    h1: { fontSize: 'clamp(2.25rem, 1.6rem + 2.4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.08 },
    h2: { fontSize: 'clamp(1.875rem, 1.4rem + 1.8vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.12 },
    h3: { fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2rem)', fontWeight: 650, letterSpacing: '-0.035em', lineHeight: 1.2 },
    h4: { fontSize: 'clamp(1.5rem, 1.2rem + 1.3vw, 2.25rem)', fontWeight: 650, letterSpacing: '-0.035em', lineHeight: 1.2 },
    h5: { fontSize: '1.25rem', fontWeight: 650, letterSpacing: '-0.025em', lineHeight: 1.3 },
    h6: { fontSize: '1.0625rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.35 },
    subtitle1: { fontSize: '1.0625rem', lineHeight: 1.6, color: '#475569' },
    subtitle2: { fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.65 },
    caption: { lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '-0.005em' },
    overline: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.16em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        html: { scrollBehavior: 'smooth', [reducedMotion]: { scrollBehavior: 'auto' } },
        body: {
          backgroundColor: theme.palette.background.default,
          backgroundImage: [
            `radial-gradient(900px 520px at 88% -8%, ${alpha(theme.palette.primary.main, 0.09)}, transparent 60%)`,
            `radial-gradient(700px 480px at -6% 4%, ${alpha(theme.palette.secondary.main, 0.06)}, transparent 60%)`,
          ].join(', '),
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        },
        '::selection': { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
        'a, button, [role="button"], input, select, textarea': {
          '&:focus-visible': {
            outline: `2px solid ${alpha(theme.palette.primary.main, 0.7)}`,
            outlineOffset: 2,
          },
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: radii.card },
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          backgroundImage: 'none',
          boxShadow: `${theme.shadows[2]}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.9)}`,
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: radii.card,
          boxShadow: `${theme.shadows[2]}, inset 0 1px 0 ${alpha(theme.palette.common.white, 0.9)}`,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        colorDefault: ({ theme }) => ({
          backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.dark,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
          fontWeight: 600,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 48,
          color: theme.palette.text.secondary,
          borderRadius: theme.shape.borderRadius,
          transition: theme.transitions.create(['color', 'background-color']),
          '&.Mui-selected': { fontWeight: 600, color: theme.palette.primary.dark },
          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -3,
          },
          [reducedMotion]: { transition: 'none' },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }),
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
          transition: theme.transitions.create(
            ['background-color', 'box-shadow', 'border-color', 'transform'],
            { duration: 160 },
          ),
          '&:active:not(.Mui-disabled)': { transform: 'scale(0.98)' },
          '&.Mui-focusVisible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            outlineOffset: 2,
          },
          '@media (pointer: coarse)': { minHeight: 44 },
          [reducedMotion]: { transition: 'none', '&:active:not(.Mui-disabled)': { transform: 'none' } },
        }),
        contained: ({ theme, ownerState }) => ({
          ...(ownerState.color === 'primary' && {
            backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.common.white, 0.14)} 0%, transparent 100%), linear-gradient(115deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          }),
          boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.22)}, 0 1px 2px ${alpha(theme.palette.primary.dark, 0.3)}`,
          '&:hover': {
            boxShadow: `inset 0 1px 0 ${alpha(theme.palette.common.white, 0.22)}, 0 6px 16px ${alpha(theme.palette.primary.main, 0.28)}`,
          },
          '&.Mui-disabled': { backgroundImage: 'none', boxShadow: 'none' },
        }),
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.4),
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }),
        text: ({ theme }) => ({
          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
        }),
      },
    },
    MuiButtonGroup: { defaultProps: { size: 'small' } },
    MuiCheckbox: { defaultProps: { size: 'small' } },
    MuiChip: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: 8, fontWeight: 500, borderColor: theme.palette.divider }),
        filled: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.dark,
        }),
      },
    },
    MuiFab: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiIconButton: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          transition: theme.transitions.create(['background-color', 'transform'], { duration: 160 }),
          '&:active': { transform: 'scale(0.94)' },
          '@media (pointer: coarse)': { minWidth: 44, minHeight: 44 },
          [reducedMotion]: { transition: 'none', '&:active': { transform: 'none' } },
        }),
      },
    },
    MuiInputBase: { defaultProps: { size: 'small' } },
    MuiInput: { defaultProps: { size: 'small' } },
    MuiFilledInput: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.white, 0.7),
          minHeight: 44,
          transition: theme.transitions.create(['background-color', 'box-shadow', 'border-color'], { duration: 160 }),
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(theme.palette.primary.main, 0.4) },
          '&.Mui-focused': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.error.main },
          '&.Mui-error.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(theme.palette.error.main, 0.12)}` },
          [reducedMotion]: { transition: 'none' },
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
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({ borderRadius: 12, border: `1px solid ${theme.palette.divider}`, alignItems: 'center' }),
        standard: ({ theme, ownerState }) => {
          const tone = ownerState.severity ?? 'info'
          const color = theme.palette[tone]
          return {
            backgroundColor: alpha(color.main, tone === 'info' ? 0.06 : 0.07),
            borderColor: alpha(color.main, 0.2),
            color: color.dark,
          }
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: { root: { borderRadius: 12, backgroundColor: ink, boxShadow: shadows[4] } },
    },
    MuiTooltip: {
      defaultProps: { arrow: true, enterDelay: 300 },
      styleOverrides: {
        tooltip: { backgroundColor: ink, borderRadius: 8, fontSize: '0.75rem', fontWeight: 500, padding: '6px 10px' },
        arrow: { color: ink },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: radii.hero,
          boxShadow: theme.shadows[4],
          backgroundImage: 'none',
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 14,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4],
          backgroundImage: 'none',
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: 14,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[4],
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          marginInline: theme.spacing(0.75),
          minHeight: 40,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 6,
          borderRadius: 999,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }),
        bar: ({ theme }) => ({
          borderRadius: 999,
          backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }),
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.07),
          [reducedMotion]: { '&::after': { animation: 'none' } },
        }),
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-completed': { color: theme.palette.success.main },
        }),
      },
    },
    MuiDivider: {
      styleOverrides: { root: ({ theme }) => ({ borderColor: theme.palette.divider }) },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { fontWeight: 600 } },
    },
  },
})

export default theme
