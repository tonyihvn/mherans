
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('[index.js] Testing local React imports...');

// Add visible debug output
document.body.style.backgroundColor = '#0000ff';
document.body.innerHTML = '<h1 style="color: white; text-align: center; margin-top: 100px;">LOCAL REACT TEST</h1>' + document.body.innerHTML;

const rootElement = document.getElementById('root');
console.log('[index.js] Root element found:', !!rootElement);

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color: red; margin: 20px;">ERROR: Could not find #root element</h1>';
  throw new Error("Could not find root element to mount to");
}

try {
  console.log('[index.js] Creating React root...');
  const root = createRoot(rootElement);

  console.log('[index.js] Rendering local React element...');
  root.render(
    React.createElement('div', {
      style: {
        minHeight: '100vh',
        backgroundColor: '#00ff00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'black',
        fontSize: '2rem',
        fontWeight: 'bold'
      }
    }, 'SUCCESS! Local React works - GREEN background')
  );

  console.log('[index.js] Local React rendered successfully');
} catch (err) {
  console.error('[index.js] Error in local render:', err);
  document.body.innerHTML = `<h1 style="color: red; margin: 20px;">ERROR: ${err.message}</h1><pre style="color: red; margin: 20px; text-align: left; overflow: auto; font-size: 12px;">${err.stack}</pre>`;
}
