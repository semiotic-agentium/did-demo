// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { jwtDecode } from 'jwt-decode';
import { getGoogleExternalClientId } from '../config';
import JsonDisplay from './JsonDisplay';
import GoogleSignInButton from './GoogleSignInButton';
import { useAgentium } from '../hooks/useAgentium';
import type { ConnectIdentityResult } from '../api/identity';

interface ZkLoginProps {
  onLoginResult?: (result: ConnectIdentityResult) => void;
}

const ZkLogin: React.FC<ZkLoginProps> = ({ onLoginResult }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [identityResult, setIdentityResult] = useState<ConnectIdentityResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const agentiumClient = useAgentium();

  // Parse JWT from URL hash once on component load with error handling
  let initialJwtTokenFromHash: string | null = null;
  let initialError: string | null = null;

  try {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    initialJwtTokenFromHash = hash.get('id_token');

    if (initialJwtTokenFromHash) {
      try {
        jwtDecode(initialJwtTokenFromHash);
        console.log('[zkLogin] JWT decoded successfully from URL hash');
      } catch (decodeError) {
        console.error('[zkLogin] Failed to decode JWT from hash:', decodeError);
        initialError = `Failed to decode JWT: ${
          decodeError instanceof Error ? decodeError.message : 'Unknown error'
        }`;
      }
    }
  } catch (err) {
    console.error('[zkLogin] Failed to parse URL hash:', err);
    initialError = `Failed to parse URL: ${err instanceof Error ? err.message : 'Unknown error'}`;
  }

  const [zkLoginJwt] = useState<string | null>(initialJwtTokenFromHash);
  const [decodedZkLoginJwt] = useState<object | null>(
    initialJwtTokenFromHash ? jwtDecode(initialJwtTokenFromHash) : null
  );

  const connectIdentityFromToken = useCallback(
    async (token: string) => {
      setConnecting(true);
      setIdentityResult(null);

      try {
        // zkLogin uses external Google OAuth, so skip audience validation
        const response = await agentiumClient.connectGoogleIdentity(token, {
          skipAudienceValidation: true,
        });

        const result: ConnectIdentityResult = {
          success: true,
          did: response.did,
          badge: response.badge,
          isNew: response.isNew,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: response.expiresIn,
        };
        setIdentityResult(result);
        onLoginResult?.(result);
      } catch (error) {
        const result: ConnectIdentityResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        setIdentityResult(result);
        onLoginResult?.(result);
      } finally {
        setConnecting(false);
      }
    },
    [onLoginResult, agentiumClient],
  );

  // Set initial error if parsing failed
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Clean the URL after the token has been processed
    if (initialJwtTokenFromHash) {
      window.history.replaceState(null, '', window.location.pathname);
      // Connect identity when JWT is received
      connectIdentityFromToken(initialJwtTokenFromHash);
    }
  }, [initialJwtTokenFromHash, connectIdentityFromToken]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Step 1: Generate ephemeral keypair
      const keypair = Ed25519Keypair.generate();

      // Step 2: Fetch max epoch
      const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch);

      // Step 3: Generate randomness
      const randomness = generateRandomness();

      // Step 4: Generate nonce
      const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

      // Step 5: Redirect to Google
      const clientId = getGoogleExternalClientId();
      if (!clientId) {
        alert('Google Client ID not configured. Please set googleClientId in config.json.');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: window.location.origin,
        response_type: 'id_token',
        scope: 'openid',
        nonce: nonce,
      });
      const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.location.href = loginURL;
    } catch (error) {
      console.error('Failed to initiate zkLogin:', error);
      alert('Failed to initiate login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flow-section">
      <div className="button-group">
        <GoogleSignInButton
          onClick={handleLogin}
          disabled={loading}
          loading={loading}
          loadingText="Preparing login..."
          text="Sign in with Google"
        />
      </div>

      {/* Display zkLogin JWT */}
      <div className="status-display">
        <h3>zkLogin JWT</h3>
        {connecting && <p>Connecting identity...</p>}
        {identityResult && (
          <div>
            {identityResult.success ? (
              <div>
                <p>✓ Identity connected successfully</p>
                <p>DID: {identityResult.did}</p>
              </div>
            ) : (
              <p>✗ Failed to connect identity: {identityResult.error}</p>
            )}
          </div>
        )}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        {zkLoginJwt ? (
          <>
            <h4>ID Token Received:</h4>
            <pre className="token-display">{zkLoginJwt}</pre>
            {decodedZkLoginJwt && (
              <>
                <h4>Decoded Payload:</h4>
                <JsonDisplay data={decodedZkLoginJwt} />
              </>
            )}
          </>
        ) : (
          <pre>Not logged in. Click the button above to sign in with Google.</pre>
        )}
      </div>
    </div>
  );
};

export default ZkLogin;
