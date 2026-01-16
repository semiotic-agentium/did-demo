// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AgentiumApiError } from '@semiotic-labs/agentium-sdk';
import { useAgentium } from '../contexts/AgentiumContext';
import { useToast } from './Toast';
import { getAccessToken } from '../auth/token-storage';
import GoogleSignInButton from './GoogleSignInButton';

/**
 * Access token JWT claims structure
 */
interface AccessTokenClaims {
  scope?: string;
  [key: string]: unknown;
}

/**
 * Component for owned Google OIDC login flow.
 *
 * This flow uses a backend-driven OAuth process where the backend handles
 * the Google token exchange and includes the DID in the access token scope.
 *
 * Uses the Agentium SDK for OIDC authentication.
 */
const OidcLogin: React.FC = () => {
  const client = useAgentium();
  const { showError } = useToast();
  const accessToken = getAccessToken();

  // Extract DID and permissions from access token scope using SDK's parseScope
  const permissions = useMemo(() => {
    if (!accessToken) {
      return null;
    }

    try {
      const claims = jwtDecode<AccessTokenClaims>(accessToken);
      const scope = claims.scope || '';
      return client.parseScope(scope);
    } catch (error) {
      console.error('[OidcLogin] Failed to decode access token:', error);
      return null;
    }
  }, [accessToken, client]);

  const handleLogin = () => {
    try {
      // Build redirect URI for callback
      const redirectUri = `${window.location.origin}/auth/oidc/callback`;
      client.startOidcLogin({ redirectUri });
    } catch (error) {
      if (error instanceof AgentiumApiError) {
        console.error('[OidcLogin] Failed to initiate login:', error);
        showError(error.message);
      } else if (error instanceof Error) {
        console.error('[OidcLogin] Unexpected error:', error);
        showError(error.message);
      } else {
        console.error('[OidcLogin] Unknown error:', error);
        showError('Failed to initiate login. Please try again.');
      }
    }
  };

  return (
    <div className="flow-section">
      <div className="button-group">
        <GoogleSignInButton onClick={handleLogin} text="Sign in with Google" />
      </div>
      <div className="status-display">
        <h3>Status</h3>
        {accessToken ? (
          <>
            <h4>Logged In Successfully</h4>
            <pre>Access Token: {accessToken.substring(0, 50)}...</pre>
            {permissions?.did ? (
              <>
                <h4>DID (from access token scope):</h4>
                <pre className="did-code">{permissions.did}</pre>
                {permissions.isNewUser && (
                  <p className="info-text">🆕 New user registration</p>
                )}
              </>
            ) : (
              <p>DID not found in access token scope</p>
            )}
          </>
        ) : (
          <pre>Not logged in. Click the button above to sign in with Google.</pre>
        )}
      </div>
    </div>
  );
};

export default OidcLogin;
