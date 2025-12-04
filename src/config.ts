// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

// Load environment variables. VITE_ prefix is required for Vite.
// IMPORTANT: Do NOT commit your actual Client ID to version control!
// Instead, create a .env file in your project root with:
// VITE_GOOGLE_CLIENT_ID="YOUR_ACTUAL_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// REDIRECT_URI can be derived dynamically from window.location.origin,
// so it does not need to be an environment variable or a constant here.
// export const REDIRECT_URI = window.location.origin;
