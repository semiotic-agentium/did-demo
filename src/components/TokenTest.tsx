// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


import React, { useState } from 'react'
import { getAgentiumClient } from '../api/agentium'
import { AgentiumApiError, type OAuthTokenResponse } from '@semiotic-labs/agentium-sdk'

interface TokenTestProps {
  refreshToken: string
}

const TokenTest: React.FC<TokenTestProps> = ({ refreshToken }) => {
  const [refreshResult, setRefreshResult] = useState<OAuthTokenResponse | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRefreshToken = async () => {
    setLoading(true)
    setError(null)
    setRefreshResult(null)

    try {
      console.log('[TokenTest] Refreshing token...')
      const client = await getAgentiumClient()
      const result = await client.refreshToken(refreshToken)
      console.log('[TokenTest] Token refreshed:', result)
      setRefreshResult(result)
    } catch (err) {
      console.error('[TokenTest] Error:', err)
      if (err instanceof AgentiumApiError) {
        setError(`API Error (${err.statusCode}): ${err.message}`)
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flow-section" style={{ marginTop: '32px' }}>
      <h2>Token Management</h2>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '16px' }}>
        Test token refresh functionality using the SDK.
      </p>

      <div className="button-group">
        <button
          onClick={handleRefreshToken}
          disabled={loading}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {loading ? '⏳ Refreshing...' : '🔄 Refresh Access Token'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff9999',
            borderRadius: '4px',
            color: '#cc0000',
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {refreshResult && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#e6ffe6',
            border: '2px solid #00aa00',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#00aa00' }}>
            ✅ Token Refreshed Successfully
          </h3>
          <div style={{ marginBottom: '8px' }}>
            <strong>Token Type:</strong> {refreshResult.token_type}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>Expires In:</strong> {refreshResult.expires_in} seconds
          </div>

          <details style={{ marginTop: '12px' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#00aa00',
              }}
            >
              View Full Response (JSON)
            </summary>
            <pre
              style={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '0.75em',
                overflowX: 'auto',
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '8px',
              }}
            >
              {JSON.stringify(refreshResult, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Current refresh token info */}
      <details style={{ marginTop: '16px' }}>
        <summary
          style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#0066cc',
          }}
        >
          View Current Refresh Token
        </summary>
        <pre
          style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: '12px',
            borderRadius: '4px',
            fontSize: '0.75em',
            overflowX: 'auto',
            maxHeight: '100px',
            overflowY: 'auto',
            marginTop: '8px',
            wordBreak: 'break-all',
          }}
        >
          {refreshToken}
        </pre>
      </details>
    </div>
  )
}

export default TokenTest
