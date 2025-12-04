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
- **DID Generation with Agentium SDK:** After a successful sign-in, the application uses the `@semiotic-labs/agentium-sdk` to connect the user's identity and generate a Decentralized Identifier (DID).

## Agentium SDK Integration

This demo showcases how to use the `@semiotic-labs/agentium-sdk` to generate a DID from a Google ID token. The core logic is encapsulated in the `src/components/DidGenerator.tsx` component.

After a successful sign-in (either standard or zkLogin), the `DidGenerator` component receives the ID token and performs the following steps:

1.  Initializes the `AgentiumClient` from the SDK.
2.  Calls the `connectGoogleIdentity` method with the ID token.
3.  Displays the received DID and a "Registered on Agentium" badge.

## For Developers

### Project Setup

1.  **Environment Variables**

    This project uses environment variables to manage sensitive information like the Google OAuth Client ID.
    - Copy `.env.example` to `.env` and set your Google OAuth Client ID.

      ```
      VITE_GOOGLE_CLIENT_ID="YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
      ```

2.  **Install Dependencies**

    Install the project dependencies using npm:

    ```bash
    npm install
    ```

3.  **Run the Application**

    To start the development server:

    ```bash
    npm run dev
    ```

    The application will typically be accessible at `http://localhost:5173`.

4.  **Google OAuth Client ID Configuration**

    For both the Standard Google Sign-In and the zkLogin flow to work, you need to configure your Google OAuth Client ID correctly in the Google Cloud Console:
    - Ensure your **Authorized JavaScript origins** includes `http://localhost:5173`.
    - Ensure your **Authorized redirect URIs** includes `http://localhost:5173`.

### Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting. The following npm scripts are available:

- **Check all (lint and format):**

  ```bash
  npm run check
  ```

- **Run Linter:**

  ```bash
  npm run lint
  ```

- **Check formatting only:**

  ```bash
  npm run format:check
  ```

- **Format code (fix issues):**
  ```bash
  npm run format:write
  ```

### REUSE Compliance

This project follows the [REUSE Specification](https://reuse.software/spec/). To ensure compliance:

1.  **Install REUSE Tool:** You'll need to install the `reuse` command-line tool, for example via `pip`:

    ```bash
    pip install reuse
    ```

2.  **Applying SPDX Headers:** To add or update SPDX license and copyright headers to all relevant files:

    ```bash
    npm run reuse:write
    ```

3.  **Verify Compliance:** To check if the project is fully REUSE compliant:

    ```bash
    npm run reuse:check
    ```

### Building the Project

To compile the TypeScript code into JavaScript in the `dist` folder:

```bash
npm run build
```

---

**Note:** This demo focuses on the frontend authentication flows and includes DID generation via the Agentium SDK. It does not include the full zkLogin proof generation and transaction signing beyond JWT retrieval.
