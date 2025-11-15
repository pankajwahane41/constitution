import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'
import './App.css'

import './styles/mobile-fixes.css'
import './styles/mobile-debug-fixes.css'
import './styles/elegant-mobile-system.css'
import './styles/responsive-fixes.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)