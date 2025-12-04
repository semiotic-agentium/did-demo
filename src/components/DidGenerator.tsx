// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { AgentiumClient } from '@semiotic-labs/agentium-sdk';

interface DidGeneratorProps {
  idToken: string | null;
}

const DidGenerator: React.FC<DidGeneratorProps> = ({ idToken }) => {
  const [did, setDid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectIdentity = async () => {
      try {
        if (import.meta.env.DEV) {
          // Mock DID response in dev mode - always show success
          await new Promise((resolve) => setTimeout(resolve, 1200));
          setDid('did:key:z6MkhaXgBZDvotDkL5257faWxcqV7aGHRLGKAJWSV5gYvR39');
        } else if (idToken) {
          const client = new AgentiumClient();
          const response = await client.connectGoogleIdentity(idToken);
          setDid(response.did);
        }
      } catch (error) {
        console.error('Failed to connect identity:', error);
        setError('Failed to connect identity');
      }
    };

    connectIdentity();
  }, []);

  return (
    <div className="did-status-container">
      <h3>DID Status</h3>
      {did ? (
        <div className="did-success">
          <div className="did-badge-section">
            <img
              src="/agentium-badge.svg"
              alt="Registered on Agentium"
              className="agentium-badge"
            />
            <p className="did-registered-text">Registered on Agentium</p>
          </div>
          <div className="did-details">
            <h4>DID Received:</h4>
            <code className="did-code">{did}</code>
          </div>
        </div>
      ) : error ? (
        <div className="did-error">
          <p className="error-text">{error}</p>
        </div>
      ) : (
        <div className="did-loading">
          <div className="spinner" />
          <p>Generating DID...</p>
        </div>
      )}
    </div>
  );
};

export default DidGenerator;
