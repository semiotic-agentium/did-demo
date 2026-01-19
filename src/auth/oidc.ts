// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { getApiBaseUrl } from '../config';
import type { TokenResponse, ProblemDetails } from '../types/auth';

/**
 * OIDC flow configuration constants
 */
const OIDC_CALLBACK_PATH = '/auth/oidc/callback';
const OIDC_LOGIN_PATH = '/auth/oidc/login';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Custom error class for OIDC flow errors
 */
export class OidcError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    code?: string,
    statusCode?: number
  ) {
    super(message);
    this.name = 'OidcError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Builds the OIDC callback redirect URI for the current origin.
 */
function buildCallbackUri(): string {
  return `${window.location.origin}${OIDC_CALLBACK_PATH}`;
}

/**
 * Builds the backend OIDC login URL with redirect_uri parameter.
 */
function buildLoginUrl(apiBaseUrl: string, redirectUri: string): string {
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
  });
  return `${apiBaseUrl}${OIDC_LOGIN_PATH}?${params.toString()}`;
}

/**
 * Builds the backend OIDC callback URL with code and state parameters.
 */
function buildCallbackUrl(apiBaseUrl: string, code: string, state: string): string {
  const params = new URLSearchParams({
    code,
    state,
  });
  return `${apiBaseUrl}${OIDC_CALLBACK_PATH}?${params.toString()}`;
}

/**
 * Initiates the owned Google OIDC login flow.
 * Redirects the browser to the backend login endpoint.
 * 
 * @throws {OidcError} if API base URL is not configured
 */
export const initiateOidcLogin = (): void => {
  const apiBaseUrl = getApiBaseUrl();
  
  if (!apiBaseUrl) {
    const error = new OidcError(
      'Backend API URL not configured. Please check your configuration.',
      'CONFIGURATION_ERROR'
    );
    console.error('[OIDC] Configuration error:', error);
    alert(error.message);
    throw error;
  }
  
  const redirectUri = buildCallbackUri();
  const loginUrl = buildLoginUrl(apiBaseUrl, redirectUri);
  
  console.log('[OIDC] Initiating login:', {
    redirectUri,
    apiBaseUrl,
    loginUrl,
  });
  
  window.location.href = loginUrl;
};

/**
 * Handles fetch errors and converts them to OidcError instances.
 */
function handleFetchError(error: unknown): OidcError {
  if (error instanceof Error) {
    if (error.name === 'AbortError') {
      return new OidcError(
        'Request timed out - the server may be taking too long to respond',
        'TIMEOUT'
      );
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new OidcError(
        `Network error: Unable to reach the server. Check your connection and CORS settings. Original error: ${error.message}`,
        'NETWORK_ERROR'
      );
    }
    return new OidcError(
      `Failed to fetch: ${error.message}`,
      'FETCH_ERROR'
    );
  }
  return new OidcError(
    'Failed to fetch: Unknown error',
    'UNKNOWN_ERROR'
  );
}

/**
 * Parses an error response from the backend.
 */
async function parseErrorResponse(response: Response): Promise<string> {
  // Read response as text first (body can only be consumed once)
  const text = await response.text().catch(() => '');
  
  try {
    // Try to parse as JSON
    const problem: ProblemDetails = JSON.parse(text);
    return problem.detail || problem.title || 'Authentication failed';
  } catch {
    // If response isn't JSON, use status text or raw text
    return response.statusText || text || 'Authentication failed';
  }
}

/**
 * Validates and parses a successful token response.
 */
async function parseTokenResponse(response: Response): Promise<TokenResponse> {
  // Read response as text first (body can only be consumed once)
  const text = await response.text().catch(() => '');
  
  try {
    // Try to parse as JSON
    const tokenResponse = JSON.parse(text) as TokenResponse;
    
    // Validate required fields
    if (!tokenResponse.access_token) {
      throw new OidcError('Access token missing from response', 'INVALID_RESPONSE');
    }
    if (!tokenResponse.refresh_token) {
      throw new OidcError('Refresh token missing from response', 'INVALID_RESPONSE');
    }
    
    console.log('[OIDC] Token response received:', {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      tokenType: tokenResponse.token_type,
      expiresIn: tokenResponse.expires_in,
    });
    
    return tokenResponse;
  } catch (error) {
    if (error instanceof OidcError) {
      throw error;
    }
    console.error('[OIDC] Failed to parse JSON response:', error);
    console.error('[OIDC] Response text:', text);
    throw new OidcError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PARSE_ERROR'
    );
  }
}

/**
 * Completes the OIDC login by exchanging the authorization code for tokens.
 * 
 * @param code - Authorization code from Google
 * @param state - State token for CSRF protection
 * @returns Promise resolving to token response
 * @throws {OidcError} if the exchange fails
 */
export const completeOidcLogin = async (
  code: string,
  state: string
): Promise<TokenResponse> => {
  const apiBaseUrl = getApiBaseUrl();
  
  if (!apiBaseUrl) {
    throw new OidcError(
      'API base URL not configured',
      'CONFIGURATION_ERROR'
    );
  }
  
  const callbackUrl = buildCallbackUrl(apiBaseUrl, code, state);
  
  console.log('[OIDC] Completing login:', {
    callbackUrl,
    codePreview: `${code.substring(0, 10)}...`,
    statePreview: `${state.substring(0, 20)}...`,
  });

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    
    response = await fetch(callbackUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // No credentials needed - we use Bearer tokens, not cookies
      // credentials: 'include' causes CORS issues when backend uses allow_origin(Any)
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
  } catch (fetchError) {
    console.error('[OIDC] Fetch failed:', fetchError);
    throw handleFetchError(fetchError);
  }

  console.log('[OIDC] Response received:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  });

  if (!response.ok) {
    const errorDetail = await parseErrorResponse(response);
    console.error('[OIDC] Error response:', {
      status: response.status,
      detail: errorDetail,
    });
    throw new OidcError(errorDetail, 'AUTHENTICATION_FAILED', response.status);
  }

  return parseTokenResponse(response);
};
