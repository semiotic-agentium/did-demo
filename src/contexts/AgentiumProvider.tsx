// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AgentiumClient } from '@semiotic-labs/agentium-sdk';
import { AgentiumContext } from './AgentiumContext';
import { getApiBaseUrl } from '../config';

interface AgentiumProviderProps {
  children: ReactNode;
}

export const AgentiumProvider: React.FC<AgentiumProviderProps> = ({ children }) => {
  const [client, setClient] = useState<AgentiumClient | undefined>(undefined);

  useEffect(() => {
    // Initialize AgentiumClient with API base URL
    const apiBaseUrl = getApiBaseUrl();
    const agentiumClient = new AgentiumClient({ baseURL: apiBaseUrl });
    setClient(agentiumClient);
  }, []);

  // Don't render children until client is initialized
  if (!client) {
    return null;
  }

  return <AgentiumContext.Provider value={client}>{children}</AgentiumContext.Provider>;
};
