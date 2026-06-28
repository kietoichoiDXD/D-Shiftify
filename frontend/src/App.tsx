import { ThemeProvider } from '@/app/providers/theme-provider'
import AutoScrollToTop from '@/components/scroll/auto-scroll-to-top'
import { AccessibilityProvider } from '@/contexts/AccessibilityContext'
import { SocketProvider } from '@/contexts/SocketContext'
import useRoutesElements from '@/hooks/routes/use-router-element'
import '@/styles/theme.css'
import '@/styles/accessibility.css'

const App = () => {
  const router = useRoutesElements()

  return (
    <ThemeProvider>
      <AccessibilityProvider>
        <SocketProvider>
          <AutoScrollToTop behavior='smooth' />
          {router}
        </SocketProvider>

      </AccessibilityProvider>

    </ThemeProvider>

  )
}

export default App
