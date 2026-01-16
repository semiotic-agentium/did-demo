// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { AgentiumClient } from '@semiotic-labs/agentium-sdk';
import { wasmUrl } from '@semiotic-labs/agentium-sdk/wasm-url';
import { getApiBaseUrl } from '../config';

const AgentiumContext = createContext<AgentiumClient | null>(null);

export function AgentiumProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    return new AgentiumClient({
      wasmUrl,
      baseURL: getApiBaseUrl(),
    });
  }, []);

  return <AgentiumContext.Provider value={client}>{children}</AgentiumContext.Provider>;
}

export function useAgentium(): AgentiumClient {
  const client = useContext(AgentiumContext);
  if (!client) {
    throw new Error('useAgentium must be used within an AgentiumProvider');
  }
  return client;
}
