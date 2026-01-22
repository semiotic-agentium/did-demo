// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React, { useState, useEffect } from 'react';
import StandardLogin from './StandardLogin';
import ZkLogin from './ZkLogin';
import OidcLogin from './OidcLogin';
import WalletLogin from './WalletLogin';

type TabType = 'standard' | 'zklogin' | 'oidc' | 'wallet';

const TAB_STORAGE_KEY = 'did-demo-active-tab';

/**
 * Tabbed interface for organizing the three login methods.
 */
const LoginTabs: React.FC = () => {
  // Initialize from localStorage or detect from URL (for OAuth redirects)
  const getInitialTab = (): TabType => {
    // Check if we're returning from zkLogin (has hash with id_token)
    const hash = window.location.hash;
    if (hash.includes('id_token=')) {
      return 'zklogin';
    }
    
    // Check localStorage for previously selected tab
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    if (stored && ['standard', 'zklogin', 'oidc', 'wallet'].includes(stored)) {
      return stored as TabType;
    }
    
    return 'oidc';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Persist tab selection to localStorage
  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  const tabs: Array<{ id: TabType; label: string; description: string }> = [
    {
      id: 'oidc',
      label: 'Owned OIDC',
      description: 'Backend-driven Google OAuth with first-party client',
    },
    {
      id: 'standard',
      label: 'External Google',
      description: 'Client-side Google Sign-In SDK',
    },
    {
      id: 'zklogin',
      label: 'zkLogin',
      description: 'Sui zkLogin flow with Google OIDC',
    },
    {
      id: 'wallet',
      label: 'Wallet',
      description: 'Sign in with MetaMask or Web3 wallet',
    },
  ];

  return (
    <div className="login-tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === 'oidc' && <OidcLogin />}
        {activeTab === 'standard' && <StandardLogin />}
        {activeTab === 'zklogin' && <ZkLogin />}
        {activeTab === 'wallet' && <WalletLogin />}
      </div>
    </div>
  );
};

export default LoginTabs;
