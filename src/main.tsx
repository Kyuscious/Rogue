import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import './styles/global.css'

// Style guard disabled - causing DOM mutation issues
// import { initStyleGuard } from './game/styleGuard'
// initStyleGuard()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
