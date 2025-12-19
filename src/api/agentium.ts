// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

// Shared AgentiumClient instance for the did-demo app
// Uses runtime config for API base URL

import { AgentiumClient, ensureWasmReady } from '@semiotic-labs/agentium-sdk';
import { wasmUrl } from '@semiotic-labs/agentium-sdk/wasm-url';
import { loadRuntimeConfig } from '../config/runtime-config';

let clientInstance: AgentiumClient | null = null;
let wasmInitialized = false;

/**
 * Gets the API base URL from runtime config or environment variable.
 */
async function getApiBaseUrl(): Promise<string> {
  try {
    const config = await loadRuntimeConfig();
    if (config.apiBaseUrl) {
      return config.apiBaseUrl;
    }
  } catch (error) {
    console.warn('[agentium] Failed to load runtime config:', error);
  }

  // Fall back to build-time env var or empty (relative URLs)
  return import.meta.env.VITE_API_BASE_URL || '';
}

/**
 * Gets or creates the shared AgentiumClient instance.
 * Lazily initializes the client with the correct base URL.
 */
export async function getAgentiumClient(): Promise<AgentiumClient> {
  if (clientInstance) {
    return clientInstance;
  }

  const baseURL = await getApiBaseUrl();
  clientInstance = new AgentiumClient({
    baseURL: baseURL || undefined, // Use SDK default if empty
  });

  console.log('[agentium] Client initialized with baseURL:', baseURL || '(default)');
  return clientInstance;
}

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
