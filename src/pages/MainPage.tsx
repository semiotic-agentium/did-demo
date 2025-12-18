// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


import React, { useState } from 'react'
import StandardLogin from '../components/StandardLogin'
import ZkLogin from '../components/ZkLogin'
import TokenTest from '../components/TokenTest'
import VCIssuance from '../components/VCIssuance'
import type { ConnectIdentityResult } from '../api/identity'

const MainPage: React.FC = () => {
  // Track login state from either login method
  const [standardLoginResult, setStandardLoginResult] =
    useState<ConnectIdentityResult | null>(null)
  const [zkLoginResult, setZkLoginResult] =
    useState<ConnectIdentityResult | null>(null)

  // Determine active login (whichever was used last)
  const activeLogin = zkLoginResult || standardLoginResult
  const hasValidLogin =
    activeLogin?.success && activeLogin?.accessToken && activeLogin?.did

  return (
    <div className="main-container">
      <div style={{ textAlign: 'center', width: '100%' }}>
        <h1>DID Identity Demo</h1>
        <p>
          Connect your Google identity to get a decentralized identifier (DID)
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <StandardLogin
          onLoginResult={(result) => setStandardLoginResult(result)}
        />
        <ZkLogin onLoginResult={(result) => setZkLoginResult(result)} />
      </div>

      {/* Token Test Section - Visible when logged in */}
      {hasValidLogin && activeLogin?.refreshToken && (
        <div
          style={{
            marginTop: '48px',
            width: '100%',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <TokenTest refreshToken={activeLogin.refreshToken} />
        </div>
      )}

      {/* VC Issuance Section - Visible when logged in */}
      {hasValidLogin && activeLogin && (
        <div
          style={{
            marginTop: '48px',
            width: '100%',
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <VCIssuance accessToken={activeLogin.accessToken!} />
        </div>
      )}
    </div>
  )
}

export default MainPage
