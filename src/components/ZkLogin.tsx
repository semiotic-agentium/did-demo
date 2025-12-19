// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect, useCallback } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { jwtDecode } from 'jwt-decode';
import { getGoogleClientId } from '../config';
import { useAgentium } from '../hooks/useAgentium';
import type { ConnectIdentityResult } from '../api/identity';

interface ZkLoginProps {
  onLoginResult?: (result: ConnectIdentityResult) => void;
}

const ZkLogin: React.FC<ZkLoginProps> = ({ onLoginResult }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
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
    // This effect now only cleans the URL after the token has been processed
    if (initialJwtTokenFromHash) {
      window.history.replaceState(null, '', window.location.pathname);
      // Connect identity when JWT is received
      connectIdentityFromToken(initialJwtTokenFromHash);
    }
  }, [initialJwtTokenFromHash, connectIdentityFromToken]);

  const handleZkLogin = async () => {
    try {
      setLoading('Preparing zkLogin...');
      setError(null);

      // Step 1: Generate ephemeral keypair
      console.log('[zkLogin] Generating ephemeral keypair...');
      const keypair = Ed25519Keypair.generate();

      // Step 2: Fetch max epoch
      setLoading('Fetching Sui network state...');
      console.log('[zkLogin] Connecting to Sui devnet...');
      const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') });
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch);
      console.log('[zkLogin] Max epoch fetched:', maxEpoch);

      // Step 3: Generate randomness
      console.log('[zkLogin] Generating randomness...');
      const randomness = generateRandomness();

      // Step 4: Generate nonce
      console.log('[zkLogin] Generating nonce...');
      const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

      // Step 5: Redirect to Google
      const clientId = getGoogleClientId();
      if (!clientId) {
        const msg = 'Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in .env';
        console.error('[zkLogin]', msg);
        setError(msg);
        setLoading(null);
        return;
      }

      console.log('[zkLogin] Redirecting to Google OAuth...');
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: window.location.origin,
        response_type: 'id_token',
        scope: 'openid',
        nonce: nonce,
      });
      const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.location.href = loginURL;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('[zkLogin] Failed to initiate zkLogin:', err);
      setError(`Failed to initiate zkLogin: ${errorMsg}`);
      setLoading(null);
    }
  };

  return (
    <div className="flow-section">
      <h2>zkLogin</h2>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div
          style={{
            padding: '10px',
            margin: '10px 0',
            backgroundColor: '#eef',
            border: '1px solid #ccf',
            borderRadius: '4px',
            color: '#006',
          }}
        >
          <strong>Loading:</strong> {loading}
        </div>
      )}

      {/* Login Button */}
      {!zkLoginJwt && (
        <div className="button-group">
          <button
            onClick={handleZkLogin}
            disabled={!!loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Preparing...' : 'Sign in with zkLogin'}
          </button>
        </div>
      )}

      {/* Result Display */}
      {zkLoginJwt && (
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
                      <strong>Badge Status:</strong> {identityResult.badge?.status || 'Unknown'}
                    </div>
                    <div
                      style={{
                        padding: '8px',
                        backgroundColor: identityResult.isNew ? '#fff4e6' : '#e6f3ff',
                        borderRadius: '4px',
                        color: identityResult.isNew ? '#cc6600' : '#0066cc',
                      }}
                    >
                      <strong>
                        {identityResult.isNew ? '🆕 New Registration' : '♻️ Existing Registration'}
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
  );
};

export default ZkLogin;
