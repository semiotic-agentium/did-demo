// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT


// Runtime configuration loaded from /config.json (overrides build-time env vars)
import { loadRuntimeConfig, type RuntimeConfig } from './config/runtime-config'

let runtimeConfig: RuntimeConfig = {}

// Initialize runtime config (call this before using GOOGLE_CLIENT_ID)
export async function initializeConfig() {
  runtimeConfig = await loadRuntimeConfig()
  return runtimeConfig
}

// Google Client ID - runtime config (from /config.json) overrides build-time env var
// IMPORTANT: Do NOT commit your actual Client ID to version control!
// For local dev, create a .env file with VITE_GOOGLE_CLIENT_ID
// For K8s, use ConfigMap to inject googleClientId at runtime
export function getGoogleClientId(): string {
  return (
    runtimeConfig.googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  )
}

// For backward compatibility, export as a getter (note: this is evaluated at module load time)
// Use getGoogleClientId() function instead for runtime config support
export const GOOGLE_CLIENT_ID = getGoogleClientId()

// REDIRECT_URI can be derived dynamically from window.location.origin,
// so it does not need to be an environment variable or a constant here.
// export const REDIRECT_URI = window.location.origin;
