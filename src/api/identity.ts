// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

// Type definitions for identity-related operations
// API calls are now handled via agentium-sdk (see api/agentium.ts)

export interface BadgeStatus {
  status: string
}

export interface ConnectIdentityResult {
  success: boolean
  did?: string
  badge?: BadgeStatus
  isNew?: boolean
  accessToken?: string
  refreshToken?: string
  expiresIn?: number
  error?: string
}
