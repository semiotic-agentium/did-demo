<!--
SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.

SPDX-License-Identifier: MIT
-->

# DID Demo Webapp

This project is a simple, single-page web application demonstrating two distinct authentication flows: a standard Google Sign-In and a zkLogin (Sui-specific login) flow using Google as the OpenID Connect (OIDC) provider.

## Features

- **Standard Google Sign-In:** Authenticates users via Google, retrieves an ID token, and displays its raw and decoded payload.
- **zkLogin Flow (Google OIDC):** Demonstrates the initial steps of a zkLogin process, including:
  - Generating an ephemeral keypair.
  - Fetching the current epoch from the Sui Devnet.
  - Generating randomness and a unique nonce.
  - Redirecting to Google for authentication with the zkLogin-specific nonce.
  - Handling the redirect back and displaying the raw and decoded ID token (JWT) obtained through the zkLogin process.

## Setup

### 1. Environment Variables

This project uses environment variables to manage sensitive information like the Google OAuth Client ID.

- Copy `.env.example` to `.env` and set your Google OAuth Client ID.

  ```
  VITE_GOOGLE_CLIENT_ID="YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  ```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Run the Application

To start the development server:

```bash
npm run dev
```

The application will typically be accessible at `http://localhost:5173`.

### 4. Google OAuth Client ID Configuration

For both the Standard Google Sign-In and the zkLogin flow to work, you need to configure your Google OAuth Client ID correctly in the Google Cloud Console:

- Ensure your **Authorized JavaScript origins** includes `http://localhost:5173`.
- Ensure your **Authorized redirect URIs** includes `http://localhost:5173`.

## Development

### Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting.

- **Run Linter:**
  ```bash
  npm run lint
  ```
- **Run Prettier (to format code):**
  ```bash
  npx prettier --write .
  ```

---

**Note:** This demo focuses on the frontend authentication flows. It does not include backend integration for DID creation or the full zkLogin proof generation and transaction signing beyond JWT retrieval.
