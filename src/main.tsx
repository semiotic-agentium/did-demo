// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeConfig } from './config'

// Initialize runtime configuration before rendering
initializeConfig()
  .then(() => {
    console.log('[did-demo] Config initialized, rendering app...')
    const rootElement = document.getElementById('root')
    if (!rootElement) {
      throw new Error('Root element not found')
    }
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
  .catch((error) => {
    console.error('[did-demo] Failed to initialize config:', error)
    const rootElement = document.getElementById('root')
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h2>Initialization Error</h2>
          <p>Failed to initialize application: ${
            error instanceof Error ? error.message : 'Unknown error'
          }</p>
          <p>Check the browser console for details.</p>
        </div>
      `
    }
  })
