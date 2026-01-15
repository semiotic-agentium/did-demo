// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { initiateOidcLogin, OidcError } from '../auth/oidc';
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
 * Extracts DID from access token scope claim.
 *
 * Scope format: "user did:pkh:... [new_user]"
 *
 * @param scope - Scope string from JWT claims
 * @returns DID string if found, null otherwise
 */
function extractDidFromScope(scope: string): string | null {
  const scopeParts = scope.split(' ');
  return scopeParts.find((part) => part.startsWith('did:')) || null;
}

/**
 * Component for owned Google OIDC login flow.
 *
 * This flow uses a backend-driven OAuth process where the backend handles
 * the Google token exchange and includes the DID in the access token scope.
 */
const OidcLogin: React.FC = () => {
  const accessToken = getAccessToken();

  // Extract DID from access token scope (backend already created it during OIDC exchange)
  const did = useMemo(() => {
    if (!accessToken) {
      return null;
    }

    try {
      const claims = jwtDecode<AccessTokenClaims>(accessToken);
      const scope = claims.scope || '';
      return extractDidFromScope(scope);
    } catch (error) {
      console.error('[OidcLogin] Failed to decode access token:', error);
      return null;
    }
  }, [accessToken]);

  const handleLogin = () => {
    try {
      initiateOidcLogin();
    } catch (error) {
      if (error instanceof OidcError) {
        console.error('[OidcLogin] Failed to initiate login:', error);
        alert(error.message);
      } else {
        console.error('[OidcLogin] Unexpected error:', error);
        alert('Failed to initiate login. Please try again.');
      }
    }
  };

  return (
    <div className="flow-section">
      <div className="button-group">
        <GoogleSignInButton
          onClick={handleLogin}
          text="Sign in with Google"
        />
      </div>
      <div className="status-display">
        <h3>Status</h3>
        {accessToken ? (
          <>
            <h4>Logged In Successfully</h4>
            <pre>Access Token: {accessToken.substring(0, 50)}...</pre>
                {did ? (
                  <>
                    <h4>DID (from access token scope):</h4>
                    <pre className="did-code">{did}</pre>
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
