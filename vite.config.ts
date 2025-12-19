// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_BASE_URL || 'http://localhost:3000';

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['@semiotic-labs/agentium-sdk'],
    },
    assetsInclude: ['**/*.wasm'],
    server: {
      fs: {
        // Allow serving files from linked packages (e.g. npm link agentium-sdk)
        // The '..' entries allow access to node_modules symlinks outside the project root
        // allow: ['../..'],
        strict: false,
      },
      proxy: {
        // Proxy OAuth token endpoint to backend server
        '/oauth/token': {
          target: apiTarget,
          changeOrigin: true,
        },
        // Proxy config.json endpoint to backend (if needed)
        '/config.json': {
          target: apiTarget,
          changeOrigin: true,
        },
        // Proxy DID identity endpoints to backend server
        '/v1': {
          target: apiTarget,
          changeOrigin: true,
        },
        // Proxy well-known DID document endpoint
        '/.well-known': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
