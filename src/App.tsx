// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


import { GoogleOAuthProvider } from '@react-oauth/google'
import MainPage from './pages/MainPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'
import { getGoogleClientId } from './config'

function App() {
  let clientId: string | null = null
  let error: Error | null = null

  try {
    clientId = getGoogleClientId()
    console.log(
      '[did-demo] Google Client ID:',
      clientId ? `${clientId.substring(0, 20)}...` : 'NOT SET'
    )
  } catch (err) {
    console.error('[App] Error getting Google Client ID:', err)
    error = err instanceof Error ? err : new Error('Unknown error')
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Application Error</h2>
        <p>An error occurred: {error.message}</p>
        <p>Check the browser console for details.</p>
      </div>
    )
  }

  if (!clientId) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Configuration Error</h2>
        <p>Google Client ID is not configured.</p>
        <p>
          Please set VITE_GOOGLE_CLIENT_ID in your .env file and restart the dev
          server.
        </p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={clientId}>
        <MainPage />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  )
}

export default App
