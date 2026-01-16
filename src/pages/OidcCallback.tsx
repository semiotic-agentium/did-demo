// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AgentiumApiError } from '@semiotic-labs/agentium-sdk';
import { useAgentium } from '../contexts/AgentiumContext';
import { useToast } from '../components/Toast';
import { storeTokens, TokenStorageError } from '../auth/token-storage';

/**
 * Callback page for OIDC authentication flow.
 *
 * This page handles the redirect from Google OAuth and completes the token exchange
 * using the Agentium SDK.
 */
const OidcCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const client = useAgentium();
  const { showError, showSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Use SDK helper to parse callback params, or get from searchParams
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (!code || !state) {
        setError('Missing authorization code or state parameter');
        setLoading(false);
        return;
      }

      try {
        // Use SDK to exchange code for tokens
        const tokenResponse = await client.exchangeOidcCode({ code, state });
        storeTokens(tokenResponse);

        // Parse scope to check if new user
        const permissions = client.parseScope(tokenResponse.scope);
        if (permissions.isNewUser) {
          showSuccess('Welcome! Your account has been created.');
        } else {
          showSuccess('Login successful!');
        }

        // Redirect to app home on success
        navigate('/', { replace: true });
      } catch (err) {
        console.error('[OidcCallback] Login failed:', err);

        let errorMessage = 'Authentication failed';
        if (err instanceof AgentiumApiError) {
          errorMessage = err.message;
        } else if (err instanceof TokenStorageError) {
          errorMessage = `Failed to store tokens: ${err.message}`;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        showError(errorMessage);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, client, showError, showSuccess]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div className="spinner" />
        <div>Completing login...</div>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          Please wait while we complete your authentication.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        <h1>Login Failed</h1>
        <p style={{ color: '#d32f2f', textAlign: 'center' }}>{error}</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return null;
};

export default OidcCallback;
