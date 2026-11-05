import '@styles/fonts/font.scss'
import '@src/index.css'
import '@src/locales/i18n'

import React from 'react'

import ReactDOM from 'react-dom/client'

import App from '@src/App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
