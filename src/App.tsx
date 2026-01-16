// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import OidcCallback from './pages/OidcCallback';
import { AgentiumProvider } from './contexts/AgentiumContext';
import { ToastProvider } from './components/Toast';
import './App.css';

function App() {
  // GoogleOAuthProvider is now only wrapping StandardLogin component, not the entire app
  // This prevents Google SDK from loading globally and interfering with owned OIDC flow
  return (
    <AgentiumProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auth/oidc/callback" element={<OidcCallback />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AgentiumProvider>
  );
}

export default App;
