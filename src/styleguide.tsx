import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/archivo'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
// Loaded only on this page, for the display-font comparison.
import '@fontsource-variable/roboto-flex'
import './styles/globals.css'
import { StyleguidePage } from './sections/StyleguidePage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StyleguidePage />
  </StrictMode>,
)
