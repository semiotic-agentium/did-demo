// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

// Shared AgentiumClient instance for the did-demo app
// Uses runtime config for API base URL

import { ensureWasmReady } from '@semiotic-labs/agentium-sdk';
import { wasmUrl } from '@semiotic-labs/agentium-sdk/wasm-url';

let wasmInitialized = false;

/**
 * Ensures WASM module is initialized for VC verification.
 * Should be called before any verification operations.
 */
export async function initializeWasm(): Promise<void> {
  if (wasmInitialized) {
    return;
  }

  try {
    // Pass the WASM URL explicitly for Vite compatibility
    await ensureWasmReady(wasmUrl);
    wasmInitialized = true;
    console.log('[agentium] WASM module initialized');
  } catch (error) {
    console.error('[agentium] Failed to initialize WASM:', error);
    throw error;
  }
}

// Re-export types from SDK for convenience
export type {
  ConnectIdentityResponse,
  ConnectGoogleIdentityOptions,
  VerificationResult,
} from '@semiotic-labs/agentium-sdk';
