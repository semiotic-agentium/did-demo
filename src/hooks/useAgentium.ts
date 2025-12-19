// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { useContext } from 'react';
import { AgentiumContext } from '../contexts/AgentiumContext';

export const useAgentium = () => {
  const context = useContext(AgentiumContext);
  if (context === undefined) {
    throw new Error('useAgentium must be used within an AgentiumProvider');
  }
  return context;
};
