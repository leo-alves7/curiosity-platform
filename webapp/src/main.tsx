import { initSentry } from './sentry'
import './i18n/index'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'

initSentry()

const container = document.getElementById('root')!
createRoot(container).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
