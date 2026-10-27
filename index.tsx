


import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color: red; padding: 20px;">ERROR: Root element not found</h1>';
  throw new Error('Root element not found');
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = `<h1 style="color: red; padding: 20px;">App Error</h1><pre>${String(error)}</pre>`;
}
