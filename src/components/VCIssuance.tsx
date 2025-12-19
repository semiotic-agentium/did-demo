// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import { initializeWasm } from '../api/agentium';
import {
  createBrowserStorage,
  type VerificationResult,
  type DidDocument,
} from '@semiotic-labs/agentium-sdk';
import { useAgentium } from '../hooks/useAgentium';

interface MembershipCredential {
  jwt: string;
  subjectDid: string;
  issuerDid: string;
  issuanceDate: string;
  expiration: string;
  enrollmentTime?: string;
  claims?: Record<string, unknown>;
}

interface VCIssuanceProps {
  accessToken: string;
}

const VCIssuance: React.FC<VCIssuanceProps> = ({ accessToken }) => {
  const [credential, setCredential] = useState<MembershipCredential | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [didDocument, setDidDocument] = useState<DidDocument | null>(null);
  const [wasmReady, setWasmReady] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agentiumClient = useAgentium();

  // Initialize WASM and browser storage on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[VCIssuance] Initializing WASM...');
        await initializeWasm();
        setWasmReady(true);
        console.log('[VCIssuance] WASM ready');

        // Set up browser storage for VCs
        agentiumClient.setVcStorage(createBrowserStorage());
        console.log('[VCIssuance] Browser storage configured');

        // Check for stored credential
        const stored = agentiumClient.getStoredCredential();
        if (stored) {
          console.log('[VCIssuance] Found stored credential');
          // Could restore the stored credential here if needed
        }
      } catch (err) {
        console.error('[VCIssuance] Init error:', err);
        setError(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    };
    init();
  }, [agentiumClient]);

  // Fetch DID document
  const fetchDidDocument = async () => {
    try {
      console.log('[VCIssuance] Fetching DID document...');
      const doc = await agentiumClient.fetchIssuerDidDocument();
      console.log('[VCIssuance] DID document:', doc);
      setDidDocument(doc);
    } catch (err) {
      console.error('[VCIssuance] DID fetch error:', err);
      setError(`DID fetch failed: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  };

  const handleIssueCredential = async () => {
    setIssuing(true);
    setError(null);
    setCredential(null);
    setVerification(null);

    try {
      // Fetch credential from backend using SDK
      const jwt = await agentiumClient.fetchMembershipCredential(accessToken);

      // Decode JWT to extract claims for display
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      const vc = payload.vc;
      const subjectDid = payload.sub || vc?.credentialSubject?.id;
      const issuerValue = vc?.issuer;
      const issuerDid =
        typeof issuerValue === 'string' ? issuerValue : issuerValue?.id || 'unknown';
      const issuanceDate = vc?.issuanceDate || payload.iat;
      const expiration = payload.exp ? new Date(payload.exp * 1000).toISOString() : undefined;
      const enrollmentTime =
        vc?.credentialSubject?.enrollmentTime || vc?.credentialSubject?.['enrollmentTime'];

      setCredential({
        jwt,
        subjectDid: subjectDid || 'unknown',
        issuerDid: issuerDid || 'unknown',
        issuanceDate: issuanceDate || new Date().toISOString(),
        expiration: expiration || 'unknown',
        enrollmentTime,
        claims: payload,
      });

      // Now verify the credential using WASM
      setVerifying(true);
      try {
        const verificationResult = await agentiumClient.verifyCredential(jwt);
        setVerification(verificationResult);

        // Store credential in browser storage if valid
        if (verificationResult.valid) {
          const storage = createBrowserStorage();
          storage.set(jwt);
          console.log('[VCIssuance] Credential stored in browser storage');
        }
      } catch (verifyError) {
        console.warn('[VC] Verification failed:', verifyError);
        setVerification({
          valid: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: verifyError instanceof Error ? verifyError.message : 'Verification failed',
          },
        });
      } finally {
        setVerifying(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIssuing(false);
    }
  };

  // Full flow using SDK's connectAndStoreMembership
  const handleFullFlow = async () => {
    setIssuing(true);
    setError(null);
    setCredential(null);
    setVerification(null);

    try {
      console.log('[VCIssuance] Running full flow (connectAndStoreMembership)...');
      const result = await agentiumClient.connectAndStoreMembership(accessToken);
      console.log('[VCIssuance] Full flow result:', result);
      setVerification(result);

      // Retrieve the stored JWT to display
      const stored = agentiumClient.getStoredCredential();
      if (stored) {
        const parts = stored.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          const vc = payload.vc;
          setCredential({
            jwt: stored,
            subjectDid: payload.sub || vc?.credentialSubject?.id || 'unknown',
            issuerDid: typeof vc?.issuer === 'string' ? vc.issuer : vc?.issuer?.id || 'unknown',
            issuanceDate: vc?.issuanceDate || new Date().toISOString(),
            expiration: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'unknown',
            enrollmentTime: vc?.credentialSubject?.enrollmentTime,
            claims: payload,
          });
        }
      }
    } catch (err) {
      console.error('[VCIssuance] Full flow error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="flow-section" style={{ marginTop: '32px' }}>
      <h2>Verifiable Credential</h2>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '16px' }}>
        Issue a membership credential that proves your identity and enrollment.
      </p>

      {/* WASM Status */}
      <div
        style={{
          padding: '8px 12px',
          marginBottom: '16px',
          backgroundColor: wasmReady ? '#e6ffe6' : '#fff4e6',
          border: `1px solid ${wasmReady ? '#00aa00' : '#cc6600'}`,
          borderRadius: '4px',
          color: wasmReady ? '#00aa00' : '#cc6600',
          fontSize: '0.9em',
        }}
      >
        {wasmReady ? '✅ WASM Module Ready' : '⏳ Loading WASM...'}
      </div>

      <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleIssueCredential}
          disabled={issuing || !wasmReady}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: issuing || !wasmReady ? '#ccc' : '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: issuing || !wasmReady ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {issuing ? '⏳ Issuing...' : '🎫 Issue Credential'}
        </button>

        <button
          onClick={handleFullFlow}
          disabled={issuing || !wasmReady}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: issuing || !wasmReady ? '#ccc' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: issuing || !wasmReady ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          {issuing ? '⏳ Processing...' : '🔄 Full Flow (Issue + Verify + Store)'}
        </button>

        <button
          onClick={fetchDidDocument}
          disabled={!wasmReady}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: !wasmReady ? '#ccc' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !wasmReady ? 'not-allowed' : 'pointer',
          }}
        >
          📄 Fetch DID Document
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff9999',
            borderRadius: '4px',
            color: '#cc0000',
          }}
        >
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {credential && (
        <div
          style={{
            marginTop: '24px',
            padding: '20px',
            backgroundColor: '#f0f8ff',
            border: '2px solid #0066cc',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#0066cc' }}>✅ Credential Issued Successfully</h3>

          {/* VC Details */}
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '1em' }}>Credential Details</h4>
            <div
              style={{
                backgroundColor: 'white',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '12px',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>Subject DID:</strong>{' '}
                <code style={{ fontSize: '0.85em' }}>{credential.subjectDid}</code>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Issuer DID:</strong>{' '}
                <code style={{ fontSize: '0.85em' }}>{credential.issuerDid}</code>
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Issuance Date:</strong> {new Date(credential.issuanceDate).toLocaleString()}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Expiration:</strong> {new Date(credential.expiration).toLocaleString()}
              </div>
              {credential.enrollmentTime && (
                <div>
                  <strong>Enrollment Time:</strong>{' '}
                  {new Date(credential.enrollmentTime).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* JWT Token Display */}
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '1em' }}>JWT Token (Credential)</h4>
            <div
              style={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                padding: '12px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.75em',
                overflowX: 'auto',
                wordBreak: 'break-all',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {credential.jwt}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(credential.jwt);
                alert('Credential JWT copied to clipboard!');
              }}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                fontSize: '0.85em',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📋 Copy JWT
            </button>
          </div>

          {/* VC JSON (decoded) */}
          {credential.claims && (
            <details style={{ marginTop: '16px' }}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: '#0066cc',
                  marginBottom: '8px',
                }}
              >
                View Decoded Credential (JSON)
              </summary>
              <pre
                style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  padding: '12px',
                  borderRadius: '4px',
                  fontSize: '0.75em',
                  overflowX: 'auto',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(credential.claims, null, 2)}
              </pre>
            </details>
          )}

          {/* Verification Result */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: verifying ? '#f5f5f5' : verification?.valid ? '#e6ffe6' : '#ffe6e6',
              border: `2px solid ${
                verifying ? '#ccc' : verification?.valid ? '#00aa00' : '#cc0000'
              }`,
            }}
          >
            <h4
              style={{
                marginTop: 0,
                marginBottom: '12px',
                color: verifying ? '#666' : verification?.valid ? '#00aa00' : '#cc0000',
              }}
            >
              {verifying
                ? '⏳ Verifying Credential...'
                : verification?.valid
                  ? '✅ Signature Verified (Ed25519)'
                  : '❌ Verification Failed'}
            </h4>

            {!verifying && verification && (
              <div style={{ fontSize: '0.9em' }}>
                {verification.valid ? (
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Algorithm:</strong> Ed25519 (via WASM)
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Status:</strong> Cryptographically valid
                    </div>
                    {verification.claims && (
                      <div>
                        <strong>Verified Claims:</strong>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          <li>Subject: {verification.claims.sub}</li>
                          {verification.claims.exp && (
                            <li>
                              Expires: {new Date(verification.claims.exp * 1000).toLocaleString()}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ color: '#cc0000' }}>
                    <strong>Error:</strong>{' '}
                    {verification.error
                      ? typeof verification.error === 'string'
                        ? verification.error
                        : `${verification.error.code}: ${verification.error.message}`
                      : 'Unknown verification error'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DID Document */}
      {didDocument && (
        <details style={{ marginTop: '16px' }}>
          <summary
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#0066cc',
              marginBottom: '8px',
            }}
          >
            View Issuer DID Document
          </summary>
          <pre
            style={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              padding: '12px',
              borderRadius: '4px',
              fontSize: '0.75em',
              overflowX: 'auto',
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(didDocument, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default VCIssuance;
