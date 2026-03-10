import { AppShell } from './components/layout/AppShell'
import { WebApp } from './components/web/WebApp'
import { isElectron } from './lib/platform'

export default function App() {
  if (isElectron) return <AppShell />
  return <WebApp />
}
