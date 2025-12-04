import React, { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import DidGenerator from './DidGenerator'
import { AgentiumClient } from '@semiotic-labs/agentium-sdk'

const StandardLogin: React.FC = () => {
  const [idToken, setIdToken] = useState<string | null>(null)
  const [decodedToken, setDecodedToken] = useState<object | null>(null)

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      const idToken = credentialResponse.credential
      setIdToken(idToken)
      const decoded = jwtDecode(idToken)
      setDecodedToken(decoded)
    } else {
      console.log('Login Failed: No credential received')
      setIdToken('Login Failed: No credential received')
      setDecodedToken(null)
    }
  }

  const handleLoginError = () => {
    console.log('Login Failed')
    setIdToken('Login Failed')
    setDecodedToken(null)
  }

  return (
    <div className="flow-section">
      <h2>Standard Google Sign-In</h2>
      <div className="button-group">
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          useOneTap
        />
      </div>
      <div className="status-display">
        <h3>Status</h3>
        {idToken ? (
          <>
            <h4>ID Token Received:</h4>
            <pre>{idToken}</pre>
            <h4>Decoded Payload:</h4>
            <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
            <DidGenerator idToken={idToken} />
          </>
        ) : (
          <pre>Not logged in</pre>
        )}
      </div>
    </div>
  )
}

export default StandardLogin
