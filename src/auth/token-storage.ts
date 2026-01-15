// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import type { TokenResponse } from '../types/auth';

/**
 * LocalStorage keys for token storage
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

/**
 * Token storage error class
 */
export class TokenStorageError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'TokenStorageError';
    this.cause = cause;
  }
}

/**
 * Stores authentication tokens in localStorage.
 * 
 * @param tokenResponse - Token response from OAuth/OIDC flow
 * @throws {TokenStorageError} if localStorage operations fail
 */
export const storeTokens = (tokenResponse: TokenResponse): void => {
  try {
    const expiryTime = Date.now() + (tokenResponse.expires_in * 1000);
    
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refresh_token);
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString());
  } catch (error) {
    throw new TokenStorageError(
      'Failed to store tokens in localStorage',
      error
    );
  }
};

/**
 * Retrieves the access token from localStorage.
 * 
 * @returns Access token string, or null if not found
 */
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.warn('[TokenStorage] Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from localStorage.
 * 
 * @returns Refresh token string, or null if not found
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.warn('[TokenStorage] Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Checks if the access token is expired.
 * 
 * @returns true if token is expired or missing, false otherwise
 */
export const isTokenExpired = (): boolean => {
  try {
    const expiryTime = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    if (!expiryTime) {
      return true;
    }
    
    const expiryTimestamp = parseInt(expiryTime, 10);
    if (isNaN(expiryTimestamp)) {
      return true;
    }
    
    return Date.now() >= expiryTimestamp;
  } catch (error) {
    console.warn('[TokenStorage] Failed to check token expiry:', error);
    return true; // Assume expired on error
  }
};

/**
 * Clears all stored tokens from localStorage.
 */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
  } catch (error) {
    console.warn('[TokenStorage] Failed to clear tokens:', error);
  }
};
