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
      if (idToken) {
        try {
          const client = new AgentiumClient();
          const response = await client.connectGoogleIdentity(idToken);
          setDid(response.did);
        } catch (error) {
          console.error('Failed to connect identity:', error);
          setError('Failed to connect identity');
        }
      }
    };

    connectIdentity();
  }, [idToken]);

  return (
    <div className="status-display">
      <h3>DID Status</h3>
      {did ? (
        <>
          <h4>DID Received:</h4>
          <pre>{did}</pre>
          <img src="/agentium-badge.svg" alt="Registered on Agentium" width="200" />
        </>
      ) : error ? (
        <pre>{error}</pre>
      ) : (
        <pre>Generating DID...</pre>
      )}
    </div>
  );
};

export default DidGenerator;
