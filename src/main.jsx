import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

try {
  var rootElement = document.getElementById('root');
  if (!rootElement) {
    document.body.innerHTML = '<div style="min-height:100vh;background:#003366;color:white;display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif"><h1>FATAL: #root element missing</h1></div>';
  } else {
    var root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <HashRouter>
          <App />
        </HashRouter>
      </StrictMode>
    );
  }
} catch (err) {
  console.error('Mount failed:', err);
  try {
    var el = document.getElementById('root');
    if (el) {
      el.innerHTML = '<div style="min-height:100vh;background:#003366;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;padding:40px"><h1 style="color:#dc2626">CRITICAL MOUNT ERROR</h1><p style="color:#ccc">' + (err.message || '') + '</p><button onclick="window.location.reload()" style="padding:10px 24px;background:white;color:#dc2626;border:none;border-radius:4px;cursor:pointer;font-weight:bold;margin-top:12px">Refresh Page</button></div>';
    }
  } catch (_) {}
}
