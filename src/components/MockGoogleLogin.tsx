import React, { useEffect } from 'react'
import type { CredentialResponse } from '@react-oauth/google'

type Props = {
  onSuccess: (response: CredentialResponse) => void
  onError?: () => void
  useOneTap?: boolean
}

function base64UrlEncode(obj: object) {
  const json = JSON.stringify(obj)
  return btoa(json)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function createFakeIdToken() {
  const header = { alg: 'none', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: 'https://accounts.google.com',
    aud: 'mock-client-id.apps.googleusercontent.com',
    sub: 'mock-sub-123456',
    email: 'mock.user@example.com',
    name: 'Mock User',
    iat: now,
    exp: now + 3600,
  }

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`
}

const MockGoogleLogin: React.FC<Props> = ({ onSuccess, onError, useOneTap }) => {
  useEffect(() => {
    if (useOneTap) {
      const t = setTimeout(() => {
        const credential = createFakeIdToken()
        onSuccess({ credential } as unknown as CredentialResponse)
      }, 500)
      return () => clearTimeout(t)
    }
  }, [useOneTap, onSuccess])

  const handleClick = () => {
    try {
      const credential = createFakeIdToken()
      onSuccess({ credential } as unknown as CredentialResponse)
    } catch (e) {
      console.error('Mock login failed', e)
      onError && onError()
    }
  }

  return (
    <button className="google-signin-mock" onClick={handleClick} type="button">
      <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.9 0 6.7 1.7 8.2 3.1l6-6C34.6 3.2 29.8 1 24 1 14.9 1 6.9 6.4 3 14.5l7.6 5.9C12.9 14.1 18 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.9c-.6 3.4-3 6-6.7 7.6l6.3 4.9C43.7 37.8 46.5 31.7 46.5 24.5z"/>
        <path fill="#4A90E2" d="M10.6 29.9A14.9 14.9 0 0 1 9 24.5c0-1.4.2-2.8.6-4.1L3 14.5C1.1 18.9 0 23.6 0 28.5s1.1 9.6 3 14l7.6-5.9z"/>
        <path fill="#FBBC05" d="M24 46c6.5 0 11.9-2.1 16-5.7l-6.3-4.9c-2.2 1.5-5 2.5-9.7 2.5-6 0-11.1-4.6-12.4-10.8L3 33.5C6.9 41.6 14.9 46 24 46z"/>
      </svg>
      <span style={{ marginLeft: 10 }}>Sign in with Google (Mock)</span>
    </button>
  )
}

export default MockGoogleLogin
