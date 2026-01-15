// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

export interface RuntimeConfig {
  googleClientId?: string;
  apiBaseUrl?: string;
}

let cachedConfig: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('/config.json');
    if (response.ok) {
      cachedConfig = await response.json();
      return cachedConfig || {};
    }
  } catch (error) {
    console.warn(
      '[Config] Failed to load runtime config, using defaults:',
      error
    );
  }

  return {};
}
