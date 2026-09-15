import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Weight axis only. The 88 KB width-axis file loads separately, and only on
// desktops where the hero name animates ('Archivo Pressure' in globals.css).
import '@fontsource-variable/archivo'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/globals.css'
import App from './App.tsx'

// Scroll reveals may only hide content once this script is actually running.
document.documentElement.classList.add('reveal-ready')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
