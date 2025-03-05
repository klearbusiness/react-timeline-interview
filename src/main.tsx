import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// React 19 way of creating root
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

const root = createRoot(rootElement)
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)
