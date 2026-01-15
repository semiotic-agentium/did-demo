// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import LoginTabs from '../components/LoginTabs';
import VcIssuance from '../components/VcIssuance';

const MainPage: React.FC = () => {
  return (
    <div className="main-container">
      <header className="app-header">
        <h1>DID & Verifiable Credentials Demo</h1>
        <p className="app-subtitle">
          Explore decentralized identity and credential issuance with multiple authentication flows
        </p>
      </header>
      
      <div className="content-sections">
        <section className="login-section">
          <h2>Authentication Methods</h2>
          <LoginTabs />
        </section>

        <section className="vc-section-main">
          <h2>Verifiable Credentials</h2>
          <VcIssuance />
        </section>
      </div>
    </div>
  );
};

export default MainPage;
