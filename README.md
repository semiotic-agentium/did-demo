<!--
SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.

SPDX-License-Identifier: MIT
-->

# Agentium SDK Demo Webapp

This project is a single-page web application demonstrating the use of the `@semiotic-labs/agentium-sdk` for Decentralized Identifier (DID) and Verifiable Credential (VC) management.

## Features

This demo showcases the following features of the `@semiotic-labs/agentium-sdk`:

- **Decentralized Identifier (DID) Creation:** Create a DID from a Google ID token.
- **Verifiable Credential (VC) Issuance:** Issue and manage the lifecycle of VCs.
- **Client-Side VC Verification:** Verify VCs on the client-side using a WebAssembly (WASM) module.
- **OAuth Token Management:** Refresh OAuth access tokens.

## How this Demo Uses the Agentium SDK

This demo showcases a modern and robust integration of the `@semiotic-labs/agentium-sdk` in a React application. The following architectural patterns and SDK features are highlighted:

- **Agentium Client:** The `AgentiumClient` is initialized once at the application's entry point (`src/main.tsx`) and provided to the entire component tree using a React Context (`src/contexts/AgentiumContext.tsx`).

- **WASM-based Verification:** The demo utilizes a WebAssembly (WASM) module for efficient, client-side verification of Verifiable Credentials. The `initializeWasm` function in `src/api/agentium.ts` ensures the WASM module is loaded and ready before any verification operations are performed.

- **Component-based Examples:** The `src/components` directory contains several React components that demonstrate different SDK features:
  - `StandardLogin.tsx` and `ZkLogin.tsx`: These components demonstrate how to use the `connectGoogleIdentity` method to create a DID from a Google ID token. They also showcase handling both standard and zkLogin authentication flows.
  - `VCIssuance.tsx`: This component demonstrates the full lifecycle of a Verifiable Credential, including fetching, verifying, and storing VCs in the browser using `fetchMembershipCredential`, `verifyCredential`, and `connectAndStoreMembership`.
  - `TokenTest.tsx`: This component illustrates how to use the `refreshToken` method to refresh OAuth access tokens.



## For Developers

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

For both the Google Sign-In and zkLogin flow to work, you need to configure your Google OAuth Client ID correctly in the Google Cloud Console:

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

**Note:** This demo focuses on the frontend authentication flows. It does not include backend integration for DID creation or the full zkLogin proof generation and transaction signing beyond JWT retrieval.
