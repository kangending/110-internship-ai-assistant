import { AppLayout } from './layouts/AppLayout'
import { CurrentActionPage } from './pages/CurrentActionPage'
import { DiagnosisPage } from './pages/DiagnosisPage'
import { HomePage } from './pages/HomePage'
import { useHashRoute } from './components/useHashRoute'

function App() {
  const route = useHashRoute()
  const page = { home: <HomePage />, diagnosis: <DiagnosisPage />, action: <CurrentActionPage /> }[route]
  return <AppLayout activeRoute={route}>{page}</AppLayout>
}

export default App
