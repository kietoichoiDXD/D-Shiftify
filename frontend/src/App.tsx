import { ThemeProvider } from '@/app/providers/theme-provider'
import AutoScrollToTop from '@/components/scroll/auto-scroll-to-top'
import { SocketProvider } from '@/contexts/SocketContext'
import useRoutesElements from '@/hooks/routes/use-router-element'
import '@/styles/theme.css'

const App = () => {
  const router = useRoutesElements()

  return (
    <ThemeProvider>
      <SocketProvider>
        <AutoScrollToTop behavior='smooth' />
        {router}
      </SocketProvider>
    </ThemeProvider>
  )
}

export default App
