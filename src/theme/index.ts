import { alpha, createTheme } from '@mui/material/styles'

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: '#f4f6fa',
          backgroundImage: `
          radial-gradient(ellipse at 15% 10%, ${alpha(theme.palette.primary.light, 0.16)}, transparent 48%), 
          radial-gradient(ellipse at 90% 85%, ${alpha(theme.palette.primary.main, 0.1)}, transparent 45%),
          linear-gradient(135deg, #fafbfd, #eef1f7)`,
          backgroundAttachment: 'fixed',
        },
      }),
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage:
            'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,255,255,0.76))',
          backdropFilter: 'blur(24px)',
          borderColor: alpha(theme.palette.common.white, 0.9),
          boxShadow: `0 24px 64px ${alpha('#233756', 0.09)}, 0 4px 12px ${alpha('#233756', 0.04)}, inset 0 1px 0 #fff`,
        }),
      },
    },
    MuiAutocomplete: { defaultProps: { size: 'small' } },
    MuiButton: {
      defaultProps: { size: 'small', disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          transition: 'background-color 180ms ease, box-shadow 180ms ease',
          '&.Mui-focusVisible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
            outlineOffset: 3,
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }),
        contained: ({ theme }) => ({
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0) 55%, rgba(0,0,0,0.08))',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 4px 10px ${alpha(theme.palette.primary.main, 0.18)}`,
          '&:hover': {
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 16px ${alpha(theme.palette.primary.main, 0.26)}`,
          },
          '&.Mui-disabled': { backgroundImage: 'none', boxShadow: 'none' },
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
          backgroundColor: alpha(theme.palette.common.white, 0.65),
          boxShadow: 'inset 0 1px 3px rgba(28,45,75,0.035)',
          '&.Mui-focused': { backgroundColor: theme.palette.common.white },
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
