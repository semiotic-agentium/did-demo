// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT
import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getAccessToken } from '../auth/token-storage';
import JsonDisplay from './JsonDisplay';
import { getApiBaseUrl } from '../config';
const VcIssuance: React.FC = () => {
  const [credential, setCredential] = useState<string | null>(null);
  const [decodedCredential, setDecodedCredential] = useState<object | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
    details?: object;
  } | null>(null);
  const accessToken = getAccessToken();
  const handleIssue = async () => {
    if (!accessToken) {
      setError('Not authenticated. Please log in first.');
      return;
    }
    setLoading(true);
    setError(null);
    setCredential(null);
    setDecodedCredential(null);
    setValidationResult(null);
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/v1/credentials/membership`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || `Failed to issue credential: ${response.statusText}`);
      }
      const data = await response.json();
      const vcJwt = data.credential;
      setCredential(vcJwt);
      try {
        const decoded = jwtDecode(vcJwt);
        setDecodedCredential(decoded);
      } catch (decodeError) {
        console.warn('Failed to decode VC JWT:', decodeError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to issue credential');
    } finally {
      setLoading(false);
    }
  };
  const handleValidate = () => {
    if (!credential) {
      setValidationResult({
        valid: false,
        message: 'No credential to validate. Issue a credential first.',
      });
      return;
    }
    setValidating(true);
    setValidationResult(null);
    try {
      const payload = jwtDecode(credential) as Record<string, unknown>;
      const checks: string[] = [];
      const details: Record<string, unknown> = { payload };
      if (payload.vc) {
        checks.push('✓ Contains VC claim');
      }
      if (payload.sub) {
        checks.push(`✓ Subject: ${payload.sub}`);
      }
      if (payload.iss) {
        checks.push(`✓ Issuer: ${payload.iss}`);
      }
      if (payload.exp) {
        const expDate = new Date((payload.exp as number) * 1000);
        const now = new Date();
        if (expDate > now) {
          checks.push(`✓ Not expired (expires: ${expDate.toISOString()})`);
        } else {
          checks.push(`✗ Expired (expired: ${expDate.toISOString()})`);
        }
      }
      const isValid = checks.every(check => check.startsWith('✓'));
      setValidationResult({
        valid: isValid,
        message: isValid
          ? 'Credential structure is valid'
          : 'Credential has validation issues',
        details: {
          checks,
          ...details,
        },
      });
    } catch (err) {
      setValidationResult({
        valid: false,
        message: err instanceof Error ? err.message : 'Failed to validate credential',
      });
    } finally {
      setValidating(false);
    }
  };
  if (!accessToken) {
    return (
      <div className="vc-section">
        <h3>Verifiable Credential</h3>
        <p className="info-text">Please log in to issue and validate credentials.</p>
      </div>
    );
  }
  return (
    <div className="vc-section">
      <h3>Verifiable Credential</h3>
      <div className="vc-actions">
        <button
          onClick={handleIssue}
          disabled={loading}
          className="primary-button"
        >
          {loading ? 'Issuing...' : 'Issue Membership Credential'}
        </button>
        {credential && (
          <button
            onClick={handleValidate}
            disabled={validating}
            className="secondary-button"
          >
            {validating ? 'Validating...' : 'Validate Credential'}
          </button>
        )}
      </div>
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
      {validationResult && (
        <div className={`validation-result ${validationResult.valid ? 'valid' : 'invalid'}`}>
          <div className="validation-header">
            <strong>{validationResult.valid ? '✓ Valid' : '✗ Invalid'}</strong>
            <span>{validationResult.message}</span>
          </div>
          {validationResult.details && (
            <details className="validation-details">
              <summary>Validation Details</summary>
              <JsonDisplay data={validationResult.details} />
            </details>
          )}
        </div>
      )}
      {credential && (
        <div className="credential-display">
          <h4>Issued Credential (JWT)</h4>
          <pre className="credential-jwt">{credential}</pre>
          {decodedCredential && (
            <>
              <h4>Decoded Credential</h4>
                <JsonDisplay data={decodedCredential} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default VcIssuance;
