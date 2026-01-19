// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import JsonDisplay from './JsonDisplay';
import { getGoogleExternalClientId, getGoogleClientId } from '../config';
import { useAgentium } from '../hooks/useAgentium';
import type { ConnectIdentityResult } from '../api/identity';
import { jwtDecode } from 'jwt-decode';

interface StandardLoginProps {
  onLoginResult?: (result: ConnectIdentityResult) => void;
}

const StandardLoginContent: React.FC<StandardLoginProps> = ({ onLoginResult }) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<object | null>(null);
  const [identityResult, setIdentityResult] = useState<ConnectIdentityResult | null>(null);
  const [connecting, setConnecting] = useState(false);
  const agentiumClient = useAgentium();

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const token = credentialResponse.credential;
      setIdToken(token);

      try {
        const decoded = jwtDecode(token);
        setDecodedToken(decoded);
      } catch (decodeError) {
        console.warn('Failed to decode JWT:', decodeError);
      }

      // Connect identity using AgentiumClient
      setConnecting(true);
      setIdentityResult(null);

      try {
        const response = await agentiumClient.connectGoogleIdentity(token);

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
    } else {
      console.log('Login Failed: No credential received');
      setIdToken(null);
      setIdentityResult(null);
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
    setIdToken(null);
    setIdentityResult(null);
  };

  return (
    <div className="flow-section">
      <div className="button-group">
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} useOneTap />
      </div>
      <div className="status-display">
        <h3>Status</h3>
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
        {idToken ? (
          <>
            <h4>ID Token Received:</h4>
            <pre className="token-display">{idToken}</pre>
            {decodedToken && (
              <>
                <h4>Decoded Payload:</h4>
                <JsonDisplay data={decodedToken} />
              </>
            )}
          </>
        ) : (
          <pre>Not logged in</pre>
        )}
      </div>
    </div>
  );
};

const StandardLogin: React.FC<StandardLoginProps> = ({ onLoginResult }) => {
  // Only wrap StandardLogin with GoogleOAuthProvider, not the entire app
  // This prevents Google SDK from loading globally and interfering with owned OIDC flow
  const [clientId, setClientId] = useState<string>('');

  useEffect(() => {
    // Load client ID from runtime config (loaded from /config.json)
    const id = getGoogleExternalClientId() || getGoogleClientId() || '';
    setClientId(id);
  }, []);

  if (!clientId) {
    return (
      <div className="flow-section">
        <h2>External Google Login</h2>
        <div className="status-display">
          <p>Google Client ID not configured. Set googleClientId in config.json or VITE_GOOGLE_EXTERNAL_CLIENT_ID in your .env file.</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <StandardLoginContent onLoginResult={onLoginResult} />
    </GoogleOAuthProvider>
  );
};

export default StandardLogin;
