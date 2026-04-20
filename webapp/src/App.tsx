import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import MapPage from './pages/MapPage'

const theme = createTheme()

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MapPage />
    </ThemeProvider>
  )
}

export default App
