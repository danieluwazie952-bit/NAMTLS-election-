import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Display runtime errors directly on screen
window.addEventListener('error', (e) => {
  const errorBox = document.createElement('div');
  errorBox.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:20px;font-family:monospace;z-index:99999;font-size:14px;';
  errorBox.innerHTML = '<h2>⚠️ RUNTIME ERROR</h2><p>' + e.message + '</p><p>' + (e.filename || '') + ':' + (e.lineno || '') + '</p>';
  document.body.prepend(errorBox);
  e.preventDefault();
});

const rootElement = document.getElementById('root');

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>
  );
  console.log('✅ NAMTLS E-Voting System mounted successfully');
} catch (err) {
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#003366;color:white;font-family:Arial,sans-serif;padding:32px;text-align:center;">
      <h1 style="color:#ffd700">NAMATL STUDENT E-VOTING</h1>
      <div style="background:#dc2626;color:white;padding:24px;border-radius:8px;max-width:400px;">
        <h2>⚠️ CRITICAL ERROR</h2>
        <p>${err.message || 'Unknown error'}</p>
      </div>
      <p style="margin-top:16px;font-size:12px;">Check browser console (F12) for full stack trace</p>
      <p style="margin-top:24px;font-size:11px;opacity:0.6;">Authorized and Verified by Meta EC</p>
    </div>
  `;
  console.error('❌ React initialization failed:', err);
}
