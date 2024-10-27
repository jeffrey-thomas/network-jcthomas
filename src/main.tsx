import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Client } from './client/components'
import './index.css'

//create base component
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Client />
  </StrictMode>,
)
