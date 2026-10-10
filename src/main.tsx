import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PrototypeProvider } from './app/PrototypeProvider'
import App from './app/App'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><PrototypeProvider><App /></PrototypeProvider></BrowserRouter></StrictMode>,
)
