// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { AgentiumClient } from '@semiotic-labs/agentium-sdk';
import { createContext } from 'react';

export const AgentiumContext = createContext<AgentiumClient | undefined>(undefined);
