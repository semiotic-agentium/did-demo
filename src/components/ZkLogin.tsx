import React, { useState, useEffect } from 'react'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { generateNonce, generateRandomness } from '@mysten/sui/zklogin'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { jwtDecode } from 'jwt-decode'
import { GOOGLE_CLIENT_ID } from '../config'
import DidGenerator from './DidGenerator'

const ZkLogin: React.FC = () => {
  const [ephemeralKeyPair, setEphemeralKeyPair] =
    useState<Ed25519Keypair | null>(null)
  const [randomness, setRandomness] = useState<string | null>(null)
  const [maxEpoch, setMaxEpoch] = useState(0)
  const [nonce, setNonce] = useState<string | null>(null)

  // Parse JWT from URL hash once on component load
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const initialJwtTokenFromHash = hash.get('id_token')

  const [zkLoginJwt] = useState<string | null>(initialJwtTokenFromHash)
  const [decodedZkLoginJwt] = useState<object | null>(
    initialJwtTokenFromHash ? jwtDecode(initialJwtTokenFromHash) : null
  )

  useEffect(() => {
    // This effect now only cleans the URL after the token has been processed
    if (initialJwtTokenFromHash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [initialJwtTokenFromHash])

  const generateAndStoreKeyPair = () => {
    const keypair = Ed25519Keypair.generate()
    setEphemeralKeyPair(keypair)
  }

  const fetchMaxEpoch = async () => {
    const suiClient = new SuiClient({ url: getFullnodeUrl('devnet') })
    const { epoch } = await suiClient.getLatestSuiSystemState()
    setMaxEpoch(Number(epoch))
  }

  const createNonce = () => {
    if (!ephemeralKeyPair || !maxEpoch || !randomness) {
      alert(
        'Please generate key pair, fetch max epoch, and generate randomness first.'
      )
      return
    }
    const newNonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness
    )
    setNonce(newNonce)
  }

  const redirectToGoogle = () => {
    if (!nonce) {
      alert('Please generate a nonce first.')
      return
    }
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'id_token',
      scope: 'openid',
      nonce: nonce,
    })
    const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    window.location.href = loginURL
  }

  return (
    <div className="flow-section">
      <h2>zkLogin Flow</h2>

      {/* Step 1: Generate Ephemeral KeyPair */}
      <div>
        <h3>1. Generate Ephemeral KeyPair</h3>
        <button onClick={generateAndStoreKeyPair}>Generate KeyPair</button>
        {ephemeralKeyPair && (
          <pre>Public Key: {ephemeralKeyPair.getPublicKey().toBase64()}</pre>
        )}
      </div>

      {/* Step 2: Generate Nonce */}
      <div>
        <h3>2. Generate Nonce</h3>
        <button onClick={fetchMaxEpoch}>Get Max Epoch</button>
        {maxEpoch > 0 && <pre>Max Epoch: {maxEpoch}</pre>}

        <button onClick={() => setRandomness(generateRandomness())}>
          Generate Randomness
        </button>
        {randomness && <pre>Randomness: {randomness}</pre>}

        <button onClick={createNonce}>Generate Nonce</button>
        {nonce && <pre>Nonce: {nonce}</pre>}
      </div>

      {/* Step 3: Sign in with Google */}
      <div>
        <h3>3. Sign In with Google (for zkLogin)</h3>
        <button onClick={redirectToGoogle}>Sign In</button>
      </div>

      {/* Step 4: Display zkLogin JWT */}
      <div className="status-display">
        <h3>zkLogin JWT</h3>
        {zkLoginJwt ? (
          <>
            <h4>ID Token Received:</h4>
            <pre>{zkLoginJwt}</pre>
            <h4>Decoded Payload:</h4>
            <pre>{JSON.stringify(decodedZkLoginJwt, null, 2)}</pre>
            <DidGenerator idToken={zkLoginJwt} />
          </>
        ) : (
          <pre>Waiting for Google redirect...</pre>
        )}
      </div>
    </div>
  )
}

export default ZkLogin
