import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyStoredTheme } from './store/themeStore'

applyStoredTheme()

createRoot(document.getElementById('root')!).render(<App />)
