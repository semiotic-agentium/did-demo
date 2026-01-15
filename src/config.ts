// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { loadRuntimeConfig, type RuntimeConfig } from './config/runtime-config';

// Runtime config loaded from /config.json (mounted from ConfigMap in K8s)
// Falls back to build-time env vars for local development
let runtimeConfig: RuntimeConfig = {};
let configLoaded = false;
let configLoadPromise: Promise<void> | null = null;

// Initialize runtime config (called on app startup)
export async function initializeConfig(): Promise<void> {
  if (configLoaded) {
    return;
  }
  if (configLoadPromise) {
    return configLoadPromise;
  }
  configLoadPromise = (async () => {
    runtimeConfig = await loadRuntimeConfig();
    configLoaded = true;
  })();
  return configLoadPromise;
}


// External Google Client ID - used for client-side Google SDK (@react-oauth/google)
// This is for StandardLogin and ZkLogin flows that use Google's client-side SDK
// Runtime config (from /config.json) takes precedence over build-time env vars
export function getGoogleExternalClientId(): string {
  // Config should be loaded by now (initialized in main.tsx before app render)
  // But we provide fallback to build-time env vars
  return (
    runtimeConfig.googleClientId ||
    import.meta.env.VITE_GOOGLE_EXTERNAL_CLIENT_ID ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ''
  );
}

// Legacy alias for backward compatibility
export function getGoogleClientId(): string {
  return getGoogleExternalClientId();
}

// API base URL for backend communication
// Runtime config (from /config.json) takes precedence over build-time env vars
export function getApiBaseUrl(): string {
  // Config should be loaded by now (initialized in main.tsx before app render)
  // But we provide fallback to build-time env vars
  const url = runtimeConfig.apiBaseUrl ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:9503';

  // Log for debugging
  if (import.meta.env.DEV) {
    console.log('[Config] API Base URL:', url, 'Runtime config:', runtimeConfig);
  }

  return url;
}

// REDIRECT_URI can be derived dynamically from window.location.origin,
// so it does not need to be an environment variable or a constant here.
// export const REDIRECT_URI = window.location.origin;
