// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { jwtDecode } from 'jwt-decode';
import { getGoogleExternalClientId } from '../config';
import DidGenerator from './DidGenerator';
import JsonDisplay from './JsonDisplay';
import GoogleSignInButton from './GoogleSignInButton';

const ZkLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);

  // Parse JWT from URL hash once on component load
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const initialJwtTokenFromHash = hash.get('id_token');

  const [zkLoginJwt] = useState<string | null>(initialJwtTokenFromHash);
  const [decodedZkLoginJwt] = useState<object | null>(
    initialJwtTokenFromHash ? jwtDecode(initialJwtTokenFromHash) : null,
  );

  useEffect(() => {
    // Clean the URL after the token has been processed
    if (initialJwtTokenFromHash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [initialJwtTokenFromHash]);

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
        {zkLoginJwt ? (
          <>
            <h4>ID Token Received:</h4>
            <pre className="token-display">{zkLoginJwt}</pre>
            <h4>Decoded Payload:</h4>
            <JsonDisplay data={decodedZkLoginJwt} />
            <DidGenerator idToken={zkLoginJwt} />
          </>
        ) : (
          <pre>Not logged in. Click the button above to sign in with Google.</pre>
        )}
      </div>
    </div>
  );
};

export default ZkLogin;
