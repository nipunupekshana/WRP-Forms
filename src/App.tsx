import { RouterProvider } from 'react-router-dom'
import { router } from './router/router'
import { ThemeProvider } from './theme/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wrp-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
