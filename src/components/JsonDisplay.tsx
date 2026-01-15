// SPDX-FileCopyrightText: 2025 Semiotic AI, Inc.
//
// SPDX-License-Identifier: MIT

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface JsonDisplayProps {
  data: unknown;
  className?: string;
}

/**
 * Displays JSON data with syntax highlighting.
 */
const JsonDisplay: React.FC<JsonDisplayProps> = ({ data, className }) => {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className={className}>
      <SyntaxHighlighter
        language="json"
        style={oneLight}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      >
        {jsonString}
      </SyntaxHighlighter>
    </div>
  );
};

export default JsonDisplay;
