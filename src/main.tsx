import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './widget.css'
import { DustidWidget } from './DustidWidget'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DustidWidget />
  </StrictMode>,
)
