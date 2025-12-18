// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { getAgentiumClient } from '../api/agentium'
import type { ConnectIdentityResult } from '../api/identity'

interface StandardLoginProps {
  onLoginResult?: (result: ConnectIdentityResult) => void
}

const StandardLogin: React.FC<StandardLoginProps> = ({ onLoginResult }) => {
  const [idToken, setIdToken] = useState<string | null>(null)
  const [identityResult, setIdentityResult] =
    useState<ConnectIdentityResult | null>(null)
  const [connecting, setConnecting] = useState(false)

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const token = credentialResponse.credential
      setIdToken(token)

      // Connect identity using AgentiumClient
      setConnecting(true)
      setIdentityResult(null)

      try {
        const client = await getAgentiumClient()
        const response = await client.connectGoogleIdentity(token)

        const result: ConnectIdentityResult = {
          success: true,
          did: response.did,
          badge: response.badge,
          isNew: response.isNew,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
        }
        setIdentityResult(result)
        onLoginResult?.(result)
      } catch (error) {
        const result: ConnectIdentityResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
        setIdentityResult(result)
        onLoginResult?.(result)
      } finally {
        setConnecting(false)
      }
    } else {
      console.log('Login Failed: No credential received')
      setIdToken('Login Failed: No credential received')
      setIdentityResult(null)
    }
  }

  const handleLoginError = () => {
    console.log('Login Failed')
    setIdToken('Login Failed')
  }

  return (
    <div className="flow-section">
      <h2>Standard Google Sign-In</h2>
      <div className="button-group">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          useOneTap
        />
      </div>
      {/* Result Display */}
      {idToken && (
        <div className="status-display">
          {/* Identity Connection Status */}
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <h3>Identity Connected</h3>
            {connecting && (
              <div style={{ color: '#0066cc' }}>
                <strong>⏳ Connecting identity...</strong>
              </div>
            )}
            {identityResult && (
              <div>
                {identityResult.success ? (
                  <div>
                    <div
                      style={{
                        color: '#00aa00',
                        marginBottom: '10px',
                        padding: '8px',
                        backgroundColor: '#f0f8f0',
                        borderRadius: '4px',
                      }}
                    >
                      <strong>✅ Identity Connected Successfully</strong>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>DID:</strong> <code>{identityResult.did}</code>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Badge Status:</strong>{' '}
                      {identityResult.badge?.status || 'Unknown'}
                    </div>
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: identityResult.isNew
                          ? '#fff4e6'
                          : '#e6f3ff',
                        borderRadius: '4px',
                        color: identityResult.isNew ? '#cc6600' : '#0066cc',
                      }}
                    >
                      <strong>
                        {identityResult.isNew
                          ? '🆕 New Registration'
                          : '♻️ Existing Registration'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      color: '#cc0000',
                      padding: '8px',
                      backgroundColor: '#ffe6e6',
                      borderRadius: '4px',
                    }}
                  >
                    <strong>❌ Connection Failed</strong>
                    <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                      {identityResult.error || 'Unknown error'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StandardLogin
