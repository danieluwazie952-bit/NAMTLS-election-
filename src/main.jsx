import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Display runtime errors directly on screen
window.addEventListener('error', (e) => {
  const errorBox = document.createElement('div');
  errorBox.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#dc2626;color:white;padding:20px;font-family:monospace;z-index:99999;font-size:14px;';
  errorBox.innerHTML = '<h2 style="margin:0 0 8px 0;font-size:18px;">⚠️ RUNTIME ERROR</h2><p style="margin:0 0 4px 0;">' + e.message + '</p><p style="margin:0;font-size:12px;opacity:0.8;">' + (e.filename || '') + ':' + (e.lineno || '') + '</p>';
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
    <div style="min-height:100vh;background:#1e3a5f;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;font-family:Arial,sans-serif;text-align:center;">
      <h1 style="font-size:28px;margin-bottom:16px;">NAMTLS Election</h1>
      <div style="background:#dc2626;padding:20px;border-radius:8px;max-width:600px;width:100%;margin-bottom:20px;">
        <h2 style="font-size:18px;margin:0 0 8px 0;color:#fff;">⚠️ CRITICAL ERROR</h2>
        <p style="margin:0;color:#fef2f2;font-family:monospace;font-size:14px;word-break:break-all;">${err.message || 'Unknown error'}</p>
      </div>
      <p style="font-size:14px;color:#94a3b8;">Check browser console (F12) for full stack trace</p>
    </div>
  `;
  console.error('❌ React initialization failed:', err);
}
